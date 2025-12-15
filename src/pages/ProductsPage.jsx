import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faHeart as faHeartSolid,
  faShoppingCart,
  faTag,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { CartContext } from "../Contexts/CartContext/CartContext";
import { formatBdt } from "../utils/currency";
import { getAllProducts } from "../api/productsAPI";

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts();
        if (response.success) {
          const transformedProducts = response.products.map((product) => ({
            id: product._id,
            name: product.name,
            priceUSD: product.priceUSD,
            priceBDT: product.priceBDT,
            originalPriceUSD: product.originalPriceUSD || null,
            originalPriceBDT: product.originalPriceBDT || null,
            image: product.images?.[0] || "https://via.placeholder.com/400",
            images: product.images || [],
            description: product.description,
            rating: product.rating || 4.5,
            reviews: product.reviews || 0,
            brand: product.brand,
            tags: product.tags || [],
            status: product.status || "available",
            category: product.category || "general",
            stock: product.stock || 0,
            badge:
              product.status === "out-of-stock"
                ? "Out of Stock"
                : product.stock < 10
                ? "Low Stock"
                : null,
          }));
          setProducts(transformedProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ["all", "dog", "cat", "rabbit", "fish", "bird"];

  // Filter products by search query and category
  const filteredProducts = products.filter((product) => {
    // Category filter
    const categoryMatch =
      selectedCategory === "all" || product.tags.includes(selectedCategory);

    // Search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const nameMatch = product.name?.toLowerCase().includes(lowerQuery);
      const descMatch = product.description?.toLowerCase().includes(lowerQuery);
      const brandMatch = product.brand?.toLowerCase().includes(lowerQuery);
      const tagsMatch = product.tags?.some((tag) =>
        tag.toLowerCase().includes(lowerQuery)
      );
      return (
        categoryMatch && (nameMatch || descMatch || brandMatch || tagsMatch)
      );
    }

    return categoryMatch;
  });

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] pt-28">
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block bg-[#FCEFD5] px-6 py-3 rounded-full mb-6">
            <span className="text-sm font-bold text-[#002A48] uppercase tracking-wide flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faTag} className="text-[#FFB84C]" />
              Premium Pet Products
            </span>
          </div>
          <h1 className="text-5xl font-extrabold text-[#002A48] mb-6">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : "Our Product Collection"}
          </h1>
          <p className="text-xl text-[#555] max-w-3xl mx-auto leading-relaxed">
            {searchQuery
              ? `Found ${filteredProducts.length} ${
                  filteredProducts.length === 1 ? "product" : "products"
                } matching your search`
              : "Discover our amazing collection of premium pet products designed to keep your furry, feathered, and finned friends happy and healthy."}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold text-sm uppercase tracking-wide transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-[#002A48] text-white shadow-lg transform scale-105"
                  : "bg-white text-[#002A48] hover:bg-[#FFB84C] hover:text-white shadow-md hover:shadow-lg"
              }`}
            >
              {category === "all" ? "All Products" : `${category} Products`}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FFB84C]"></div>
            <p className="ml-4 text-[#002A48] text-lg font-semibold">
              Loading products...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group relative cursor-pointer transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => handleProductClick(product.id)}
              >
                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 left-4 z-10 bg-[#FFB84C] text-[#002A48] px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {product.badge}
                  </div>
                )}

                {/* Wishlist Button */}
                <button
                  className="absolute top-4 right-4 z-10 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-[#FFB84C] transition-all duration-300 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(`Added ${product.name} to wishlist`);
                  }}
                >
                  <FontAwesomeIcon
                    icon={
                      hoveredProduct === product.id
                        ? faHeartSolid
                        : faHeartRegular
                    }
                    className={
                      hoveredProduct === product.id
                        ? "text-red-500"
                        : "text-gray-400"
                    }
                  />
                </button>

                {/* Product Image */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] h-64">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x300?text=Pet+Product";
                    }}
                  />

                  {/* Quick View Button */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <button className="bg-white text-[#002A48] px-4 py-2 rounded-full font-semibold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
                      <FontAwesomeIcon icon={faEye} />
                      Quick View
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  {/* Brand & Rating */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#FFB84C] uppercase tracking-wide">
                      {product.brand}
                    </span>
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="text-[#FFB84C] text-sm"
                      />
                      <span className="text-sm font-semibold text-[#002A48]">
                        {product.rating}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({product.reviews})
                      </span>
                    </div>
                  </div>

                  {/* Product Name */}
                  <h3 className="text-lg font-bold text-[#002A48] mb-2 line-clamp-2 group-hover:text-[#FFB84C] transition-colors duration-300">
                    {product.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {product.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="bg-[#F1F5F9] text-[#002A48] px-2 py-1 rounded-full text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#002A48]">
                        {formatBdt(product.priceBDT)}
                      </span>
                      {product.originalPriceBDT && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatBdt(product.originalPriceBDT)}
                        </span>
                      )}
                    </div>

                    <button
                      className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                        product.status === "out-of-stock"
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-[#002A48] text-white hover:bg-[#FFB84C] hover:text-[#002A48] shadow-md hover:shadow-lg"
                      }`}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (product.status !== "out-of-stock") {
                          const result = await addToCart(product, 1);
                          if (result.success) {
                            alert(`${product.name} added to cart!`);
                          }
                        }
                      }}
                      disabled={product.status === "out-of-stock"}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} />
                      {product.status === "out-of-stock"
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Products Found */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-[#002A48] mb-2">
              No Products Found
            </h3>
            <p className="text-gray-600">
              Try selecting a different category or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
