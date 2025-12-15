import React, { useState, useEffect, useContext, useCallback } from "react";
import { CartContext } from "./CartContext";
import { AuthContext } from "../AuthContext/AuthContext";
import axios from "axios";
import { usdToBdt, parsePrice } from "../../utils/currency";

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const { user } = useContext(AuthContext);

  const BACKEND_URL = "http://localhost:3000";

  // Load cart from backend when user logs in
  useEffect(() => {
    if (user?.email) {
      fetchCart();
    } else {
      setCartItems([]);
      setAppliedCoupon(null);
    }
  }, [user]);

  // Fetch cart from backend
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/cart/${user.email}`);
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    try {
      if (!user || !user.email) {
        return { success: false, message: "Please login to add items to cart" };
      }

      // Extract priceUSD from product (could be product.priceUSD or product.price)
      const priceUSD = product.priceUSD || parsePrice(product.price);
      const priceBDT = product.priceBDT || usdToBdt(priceUSD);

      const cartItem = {
        userId: user.email,
        productId: product.id || product._id,
        productName: product.name,
        productImage: product.image || product.images?.[0],
        priceUSD: priceUSD,
        priceBDT: priceBDT,
        quantity: quantity,
      };

      console.log("Adding to cart:", cartItem);
      const response = await axios.post(`${BACKEND_URL}/cart/add`, cartItem);

      if (response.data.success) {
        setCartItems(response.data.cart.items);
        return { success: true, message: "Item added to cart" };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to add item",
        };
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to add item to cart";
      return { success: false, message: errorMsg };
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const response = await axios.patch(
        `${BACKEND_URL}/cart/update/${itemId}`,
        {
          userId: user?.email,
          quantity: newQuantity,
        }
      );

      if (response.data.success) {
        setCartItems(response.data.cart.items);
        return { success: true };
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      return { success: false, message: "Failed to update quantity" };
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      const response = await axios.delete(
        `${BACKEND_URL}/cart/remove/${itemId}`,
        {
          data: { userId: user?.email },
        }
      );

      if (response.data.success) {
        setCartItems(response.data.cart.items);
        return { success: true, message: "Item removed from cart" };
      }
    } catch (error) {
      console.error("Error removing item:", error);
      return { success: false, message: "Failed to remove item" };
    }
  };

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/cart/clear`, {
        data: { userId: user?.email },
      });

      if (response.data.success) {
        setCartItems([]);
        setAppliedCoupon(null);
        return { success: true };
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      return { success: false };
    }
  }, [user?.email]);

  // Apply coupon
  const applyCoupon = async (couponCode) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/coupon/apply`, {
        userId: user?.email,
        couponCode: couponCode,
        subtotal: getSubtotal(),
      });

      if (response.data.success) {
        setAppliedCoupon(response.data.coupon);
        return { success: true, coupon: response.data.coupon };
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Invalid coupon code",
      };
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Calculate subtotal
  const getSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.priceBDT || item.price || 0;
      return total + itemPrice * item.quantity;
    }, 0);
  };

  // Calculate discount
  const getDiscount = () => {
    if (!appliedCoupon) return 0;

    const subtotal = getSubtotal();
    if (appliedCoupon.type === "percentage") {
      return (subtotal * appliedCoupon.value) / 100;
    } else if (appliedCoupon.type === "fixed") {
      return Math.min(appliedCoupon.value, subtotal);
    }
    return 0;
  };

  // Calculate tax (5%)
  const getTax = () => {
    const subtotal = getSubtotal();
    const discount = getDiscount();
    return (subtotal - discount) * 0.05;
  };

  // Calculate shipping (flat rate)
  const getShipping = () => {
    return cartItems.length > 0 ? 60 : 0;
  };

  // Calculate total
  const getTotal = () => {
    const subtotal = getSubtotal();
    const discount = getDiscount();
    const tax = getTax();
    const shipping = getShipping();
    return subtotal - discount + tax + shipping;
  };

  // Get cart count
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    appliedCoupon,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscount,
    getTax,
    getShipping,
    getTotal,
    getCartCount,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartProvider;
