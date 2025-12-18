/**
 * Wishlist API Functions
 * All API calls for wishlist operations
 */

import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/wishlist";

/**
 * Toggle product in wishlist (add or remove)
 * @param {string} userEmail - User's email
 * @param {string} productId - Product ID
 * @param {object} productSnapshot - Product snapshot data
 * @returns {Promise} API response
 */
export const toggleWishlist = async (userEmail, productId, productSnapshot = {}) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/toggle`, {
            userEmail,
            productId,
            productSnapshot,
        });
        return response.data;
    } catch (error) {
        console.error("Toggle wishlist error:", error);
        throw error.response?.data || error.message;
    }
};

/**
 * Get user's wishlist
 * @param {string} userEmail - User's email
 * @returns {Promise} Wishlist items
 */
export const getWishlist = async (userEmail) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${userEmail}`);
        return response.data;
    } catch (error) {
        console.error("Get wishlist error:", error);
        throw error.response?.data || error.message;
    }
};

/**
 * Remove product from wishlist
 * @param {string} userEmail - User's email
 * @param {string} productId - Product ID
 * @returns {Promise} API response
 */
export const removeFromWishlist = async (userEmail, productId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/remove`, {
            data: { userEmail, productId },
        });
        return response.data;
    } catch (error) {
        console.error("Remove from wishlist error:", error);
        throw error.response?.data || error.message;
    }
};

/**
 * Clear entire wishlist
 * @param {string} userEmail - User's email
 * @returns {Promise} API response
 */
export const clearWishlist = async (userEmail) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/clear/${userEmail}`);
        return response.data;
    } catch (error) {
        console.error("Clear wishlist error:", error);
        throw error.response?.data || error.message;
    }
};

/**
 * Check if products are in wishlist (bulk check)
 * @param {string} userEmail - User's email
 * @param {Array<string>} productIds - Array of product IDs
 * @returns {Promise} Array of wishlisted product IDs
 */
export const checkWishlistStatus = async (userEmail, productIds) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/check`, {
            userEmail,
            productIds,
        });
        return response.data;
    } catch (error) {
        console.error("Check wishlist status error:", error);
        throw error.response?.data || error.message;
    }
};
