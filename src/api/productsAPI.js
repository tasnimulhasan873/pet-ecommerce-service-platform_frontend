import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

// Public API - Get all products
export const getAllProducts = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/products`);
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

// Public API - Get single product by ID
export const getProductById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/products/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching product:", error);
        throw error;
    }
};

// Admin API - Create new product
export const createProduct = async (productData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/admin/products`,
            productData
        );
        return response.data;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
};

// Admin API - Update product
export const updateProduct = async (id, productData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/admin/products/${id}`,
            productData
        );
        return response.data;
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
};

// Admin API - Delete product
export const deleteProduct = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/admin/products/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};

// Admin API - Update product stock
export const updateProductStock = async (id, stock) => {
    try {
        const response = await axios.patch(
            `${API_BASE_URL}/admin/products/${id}/stock`,
            { stock }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating stock:", error);
        throw error;
    }
};
