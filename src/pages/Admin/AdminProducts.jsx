import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faBox,
  faSearch,
  faEye,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import {
  getAllProducts,
  deleteProduct,
  updateProductStock,
} from "../../api/productsAPI";
import { formatBdt } from "../../utils/currency";

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts();
      if (response.success) {
        setProducts(response.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm('Are you sure you want to delete "' + name + '"?')) {
      try {
        const response = await deleteProduct(id);
        if (response.success) {
          alert("Product deleted successfully!");
          fetchProducts();
        }
      } catch (error) {
        alert("Failed to delete product");
      }
    }
  };

  const handleStockUpdate = async (id, currentStock) => {
    const newStock = prompt(
      `Enter new stock quantity (Current: ${currentStock}):`
    );
    if (newStock !== null && !isNaN(newStock)) {
      try {
        const response = await updateProductStock(id, parseInt(newStock));
        if (response.success) {
          alert("Stock updated successfully!");
          fetchProducts();
        }
      } catch (error) {
        alert("Failed to update stock");
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "all",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-[#002A48] to-[#004080] p-4 rounded-2xl shadow-lg mr-4">
              <FontAwesomeIcon icon={faBox} className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#002A48] mb-1">
                Product Management
              </h1>
              <p className="text-gray-600">
                Manage your e-commerce product catalog
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin-products/add")}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition shadow-lg flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Product
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002A48] focus:border-transparent"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002A48] focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all"
                    ? "All Categories"
                    : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FontAwesomeIcon
              icon={faBox}
              className="text-6xl text-gray-300 mb-4"
            />
            <p className="text-gray-500 text-lg mb-4">
              {searchQuery || filterCategory !== "all"
                ? "No products found matching your criteria"
                : "No products yet. Add your first product!"}
            </p>
            <button
              onClick={() => navigate("/admin-products/add")}
              className="bg-[#002A48] text-white px-6 py-3 rounded-lg hover:bg-[#003d6b] transition"
            >
              Add First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition group"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img
                    src={
                      product.images?.[0] || "https://via.placeholder.com/400"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400?text=Product";
                    }}
                  />
                  {product.stock <= 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      Out of Stock
                    </div>
                  )}
                  {product.stock > 0 && product.stock < 10 && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Low Stock: {product.stock}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#002A48] mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {product.category || "Uncategorized"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-[#FFB84C]">
                        {formatBdt(product.priceBDT)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Stock: {product.stock || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Brand</p>
                      <p className="font-semibold text-[#002A48]">
                        {product.brand}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-1"
                      title="View"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/admin-products/edit/${product._id}`)
                      }
                      className="bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition flex items-center justify-center gap-1"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id, product.name)}
                      className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition flex items-center justify-center gap-1"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      handleStockUpdate(product._id, product.stock || 0)
                    }
                    className="w-full mt-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                  >
                    Update Stock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
