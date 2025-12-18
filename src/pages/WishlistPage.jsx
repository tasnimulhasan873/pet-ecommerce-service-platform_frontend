/**
 * Wishlist Page
 * Displays user's wishlist with add to cart and remove functionality
 */

import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faShoppingCart,
  faTrash,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { WishlistContext } from "../Contexts/WishlistContext/WishlistContext";
import { CartContext } from "../Contexts/CartContext/CartContext";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import { formatBdt } from "../utils/currency";

const WishlistPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { wishlist, removeFromWishlist, wishlistLoading, fetchWishlist } =
    useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user?.email) {
      alert("Please login to view your wishlist");
      navigate("/login");
      return;
    }

    // Fetch wishlist on mount
    fetchWishlist();
  }, [user, navigate]);

  /**
   * Handle add to cart and remove from wishlist
   */
  const handleAddToCart = async (item) => {
    try {
      setLoading(true);

      // Build product data from productSnapshot or productId object
      const productData =
        item.productSnapshot && Object.keys(item.productSnapshot).length > 0
          ? { ...item.productSnapshot, _id: item.productId }
          : typeof item.productId === "object"
          ? item.productId
          : { _id: item.productId };

      // Add to cart
      await addToCart(productData, 1);

      // Remove from wishlist
      const productId = item.productId || item._id;
      await removeFromWishlist(productId);

      alert("Product added to cart and removed from wishlist");
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Failed to add product to cart");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle remove from wishlist
   */
  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      const result = await removeFromWishlist(productId);
      if (result.success) {
        alert("Removed from wishlist");
      }
    } catch (error) {
      console.error("Remove error:", error);
      alert("Failed to remove from wishlist");
    } finally {
      setRemovingId(null);
    }
  };

  if (wishlistLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#002A48] hover:text-[#FFB84C] mb-4 transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span className="font-semibold">Back</span>
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-red-500 to-pink-600 p-4 rounded-2xl shadow-lg">
                <FontAwesomeIcon
                  icon={faHeart}
                  className="text-3xl text-white"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#002A48] mb-1">
                  My Wishlist
                </h1>
                <p className="text-gray-600">
                  {wishlist.length} {wishlist.length === 1 ? "item" : "items"}{" "}
                  saved
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FontAwesomeIcon
              icon={faHeart}
              className="text-6xl text-gray-300 mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Save your favorite products for later!
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-[#002A48] text-white px-6 py-3 rounded-lg hover:bg-[#FFB84C] hover:text-[#002A48] transition font-semibold"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              // Extract product data from productSnapshot (preferred) or fallback
              const product =
                item.productSnapshot &&
                Object.keys(item.productSnapshot).length > 0
                  ? { ...item.productSnapshot, _id: item.productId }
                  : typeof item.productId === "object"
                  ? item.productId
                  : { _id: item.productId };

              const productId = item.productId || item._id;

              return (
                <div
                  key={item._id || productId}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition group"
                >
                  {/* Product Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <img
                      src={
                        product.images?.[0] ||
                        product.image ||
                        (Array.isArray(product.images)
                          ? product.images[0]
                          : null) ||
                        "https://via.placeholder.com/400"
                      }
                      alt={product.name || "Product"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/400?text=Product";
                      }}
                    />

                    {/* Remove Button (Top Right) */}
                    <button
                      onClick={() => handleRemove(productId)}
                      disabled={removingId === productId}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-red-500 text-red-500 hover:text-white p-2.5 rounded-full shadow-lg transition transform hover:scale-110 disabled:opacity-50"
                      title="Remove from wishlist"
                    >
                      {removingId === productId ? (
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      ) : (
                        <FontAwesomeIcon icon={faTrash} />
                      )}
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-[#002A48] mb-2 line-clamp-2 min-h-[56px]">
                      {product.name || product.title || "Product"}
                    </h3>

                    <div className="mb-4">
                      <p className="text-2xl font-bold text-[#FFB84C]">
                        {formatBdt(
                          product.priceBDT ||
                            product.price ||
                            product.priceUSD ||
                            0
                        )}
                      </p>
                      {product.category && (
                        <p className="text-sm text-gray-500 capitalize mt-1">
                          {product.category}
                        </p>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={
                        loading ||
                        (product.stock !== undefined && product.stock === 0)
                      }
                      className="w-full bg-[#002A48] text-white py-3 rounded-lg hover:bg-[#FFB84C] hover:text-[#002A48] transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FontAwesomeIcon icon={faShoppingCart} />
                      {product.stock !== undefined && product.stock === 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Continue Shopping */}
        {wishlist.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/products")}
              className="bg-white text-[#002A48] px-8 py-3 rounded-lg hover:bg-[#002A48] hover:text-white transition font-semibold shadow-lg"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
