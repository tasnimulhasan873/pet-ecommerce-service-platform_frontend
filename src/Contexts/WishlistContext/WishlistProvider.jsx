/**
 * Wishlist Provider
 * Manages wishlist state with localStorage sync and backend API integration
 */

import React, { useState, useEffect, useContext } from "react";
import { WishlistContext } from "./WishlistContext";
import { AuthContext } from "../AuthContext/AuthContext";
import {
  getWishlist as fetchWishlistAPI,
  toggleWishlist as toggleWishlistAPI,
  removeFromWishlist as removeFromWishlistAPI,
} from "../../api/wishlistAPI";

const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Get user email safely
  const getUserEmail = () => {
    return user?.email || null;
  };

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const storedWishlist = localStorage.getItem("wishlist");
    if (storedWishlist) {
      try {
        const parsed = JSON.parse(storedWishlist);
        setWishlist(parsed);
        setWishlistCount(parsed.length);
      } catch (error) {
        console.error("Failed to parse wishlist from localStorage:", error);
      }
    }
  }, []);

  // Fetch wishlist from backend when user logs in
  useEffect(() => {
    if (user?.email) {
      fetchWishlist();
    } else {
      // Clear wishlist when user logs out
      setWishlist([]);
      setWishlistCount(0);
      localStorage.removeItem("wishlist");
    }
  }, [user]);

  // Sync wishlist to localStorage whenever it changes
  useEffect(() => {
    if (wishlist.length > 0) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    } else {
      localStorage.removeItem("wishlist");
    }
    setWishlistCount(wishlist.length);
  }, [wishlist]);

  /**
   * Fetch wishlist from backend
   */
  const fetchWishlist = async () => {
    const userEmail = getUserEmail();
    if (!userEmail) return;

    try {
      setWishlistLoading(true);
      const response = await fetchWishlistAPI(userEmail);
      if (response.success) {
        setWishlist(response.wishlist || []);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  /**
   * Check if product is in wishlist
   * @param {string} productId - Product ID
   * @returns {boolean}
   */
  const isInWishlist = (productId) => {
    return wishlist.some(
      (item) =>
        item.productId === productId ||
        item.productId?._id === productId ||
        item._id === productId
    );
  };

  /**
   * Toggle product in wishlist (add or remove)
   * @param {object} product - Product object
   */
  const toggleWishlist = async (product) => {
    const userEmail = getUserEmail();
    if (!userEmail) {
      alert("Please login to add items to wishlist");
      return { success: false, message: "User not logged in" };
    }

    try {
      const productId = product._id || product.id;

      // Create productSnapshot with essential product data
      const productSnapshot = {
        name: product.name,
        price: product.priceBDT || product.price,
        priceBDT: product.priceBDT,
        priceUSD: product.priceUSD,
        image: product.images?.[0] || product.image,
        images: product.images,
        category: product.category,
        brand: product.brand,
        stock: product.stock,
        description: product.description,
      };

      const response = await toggleWishlistAPI(
        userEmail,
        productId,
        productSnapshot
      );

      if (response.success) {
        if (response.action === "added") {
          // Add to local state
          const newItem = {
            _id: response.wishlistItem?._id || productId,
            productId: productId,
            productSnapshot: productSnapshot,
            userEmail,
            createdAt: new Date().toISOString(),
          };
          setWishlist((prev) => [...prev, newItem]);
          return {
            success: true,
            action: "added",
            message: "Added to wishlist",
          };
        } else {
          // Remove from local state
          setWishlist((prev) =>
            prev.filter(
              (item) =>
                item.productId?._id !== productId &&
                item.productId !== productId
            )
          );
          return {
            success: true,
            action: "removed",
            message: "Removed from wishlist",
          };
        }
      }

      return response;
    } catch (error) {
      console.error("Toggle wishlist error:", error);
      return {
        success: false,
        message: error.message || "Failed to update wishlist",
      };
    }
  };

  /**
   * Remove product from wishlist
   * @param {string} productId - Product ID
   */
  const removeFromWishlist = async (productId) => {
    const userEmail = getUserEmail();
    if (!userEmail) return;

    try {
      const response = await removeFromWishlistAPI(userEmail, productId);
      if (response.success) {
        setWishlist((prev) =>
          prev.filter(
            (item) =>
              item.productId?._id !== productId && item.productId !== productId
          )
        );
        return { success: true, message: "Removed from wishlist" };
      }
      return response;
    } catch (error) {
      console.error("Remove from wishlist error:", error);
      return { success: false, message: "Failed to remove from wishlist" };
    }
  };

  /**
   * Clear entire wishlist
   */
  const clearWishlist = () => {
    setWishlist([]);
    setWishlistCount(0);
    localStorage.removeItem("wishlist");
  };

  /**
   * Get wishlist count
   * @returns {number}
   */
  const getWishlistCount = () => {
    return wishlistCount;
  };

  const wishlistInfo = {
    wishlist,
    wishlistLoading,
    wishlistCount,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    getWishlistCount,
    fetchWishlist,
  };

  return (
    <WishlistContext.Provider value={wishlistInfo}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;
