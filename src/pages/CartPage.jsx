import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../Contexts/CartContext/CartContext";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import CartItem from "../components/CartItem";
import CouponBox from "../components/CouponBox";
import OrderSummary from "../components/OrderSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faArrowLeft,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

const CartPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    cartItems,
    loading,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscount,
    getTax,
    getShipping,
    getTotal,
  } = useContext(CartContext);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/cart" } } });
    }
  }, [user, navigate]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this item?"
    );
    if (confirmed) {
      await removeFromCart(itemId);
    }
  };

  const handleApplyCoupon = async (couponCode) => {
    return await applyCoupon(couponCode);
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FFB84C] mx-auto mb-4"></div>
          <p className="text-[#002A48] text-lg font-semibold">
            Loading cart...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] pt-24 sm:pt-28 pb-8 sm:pb-12">
      {/* Responsive container padding */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Responsive spacing and sizing */}
        <div className="mb-6 sm:mb-8">
          {/* Back button - Responsive text */}
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-[#002A48] hover:text-[#FFB84C] font-semibold mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Continue Shopping</span>
          </Link>

          {/* Title section - Responsive sizing */}
          <div className="flex items-center gap-2 sm:gap-3">
            <FontAwesomeIcon
              icon={faShoppingCart}
              className="text-[#FFB84C] text-2xl sm:text-3xl"
            />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#002A48]">
              Shopping Cart
            </h1>
          </div>
          {/* Item count - Responsive text */}
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>

        {/* Empty Cart - Responsive padding and sizing */}
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 sm:p-10 lg:p-12 text-center">
            <FontAwesomeIcon
              icon={faBoxOpen}
              className="text-gray-300 text-4xl sm:text-5xl lg:text-6xl mb-4 sm:mb-6"
            />
            <h2 className="text-xl sm:text-2xl font-bold text-[#002A48] mb-3 sm:mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Add some products to get started!
            </p>
            <Link
              to="/products"
              className="inline-block bg-[#FFB84C] text-[#002A48] font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-[#002A48] hover:text-white transition-all duration-300 text-sm sm:text-base"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          /* Grid: single column on mobile, 3 columns on large screens - responsive gap */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Side - Cart Items & Coupon */}
            <div className="lg:col-span-2">
              {/* Cart Items */}
              <div className="mb-6">
                {cartItems.map((item) => (
                  <CartItem
                    key={item._id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>

              {/* Coupon Section */}
              <CouponBox
                onApplyCoupon={handleApplyCoupon}
                appliedCoupon={appliedCoupon}
                onRemoveCoupon={handleRemoveCoupon}
              />
            </div>

            {/* Right Side - Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                subtotal={getSubtotal()}
                discount={getDiscount()}
                tax={getTax()}
                shipping={getShipping()}
                total={getTotal()}
                appliedCoupon={appliedCoupon}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
