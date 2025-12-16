import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {
  faStar,
  faHeart as faHeartSolid,
  faShoppingCart,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { CartContext } from "../Contexts/CartContext/CartContext";
import { formatBdt } from "../utils/currency";
import { getAllProducts } from "../api/productsAPI";

const ProductSection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts();
        if (response.success) {
          // Get first 6 products for the homepage
          const transformedProducts = response.products
            .slice(0, 6)
            .map((product) => ({
              id: product._id,
              name: product.name,
              priceUSD: product.priceUSD,
              priceBDT: product.priceBDT,
              originalPriceUSD: product.originalPriceUSD || null,
              originalPriceBDT: product.originalPriceBDT || null,
              image: product.images?.[0] || "https://via.placeholder.com/400",
              description: product.description?.substring(0, 50) + "..." || "",
              rating: product.rating || 4.5,
              stock: product.stock || 0,
              badge:
                product.status === "out-of-stock"
                  ? "Out of Stock"
                  : product.stock < 10
                  ? "Low Stock"
                  : null,
              brand: product.brand,
              tags: product.tags || [],
              status: product.status,
            }));
          setProducts(transformedProducts);
          setFilteredProducts(transformedProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter when URL ?search= changes or when products are loaded
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      {/* Responsive container padding */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Responsive text sizing */}
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <div className="inline-block bg-[#FCEFD5] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm font-bold text-[#002A48] uppercase tracking-wide flex items-center justify-center gap-1.5 sm:gap-2">
              <FontAwesomeIcon icon={faStar} className="text-[#FFB84C]" /> Top
              Picks
            </span>
          </div>
          {/* Heading - Scales from mobile to desktop */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#002A48] mb-3 sm:mb-4 px-4">
            Featured Products
          </h2>
          {/* Description - Better line height and sizing for mobile */}
          <p className="text-base sm:text-lg lg:text-xl text-[#555] max-w-2xl mx-auto px-4 leading-relaxed">
            Curated selection of the best products loved by pets and their
            parents
          </p>
        </div>

        {/* Product Grid - Responsive loading state */}
        {loading ? (
          <div className="flex flex-col sm:flex-row justify-center items-center py-16 sm:py-20">
            <div className="loading-spinner mb-3 sm:mb-0"></div>
            <p className="sm:ml-4 text-[#002A48] text-sm sm:text-base">
              Loading products...
            </p>
          </div>
        ) : (
          /* Grid: 1 col mobile, 2 cols tablet, 3 cols desktop - responsive gap sizing */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group relative cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 left-4 z-10 bg-[#FFB84C] text-[#002A48] px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {product.badge}
                  </div>
                )}

                {/* Wishlist Button */}
                <button
                  className="absolute top-4 right-4 z-10 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-[#FFB84C] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to wishlist logic here
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

                {/* Product Image - Responsive height */}
                <div className="bg-gradient-to-br from-[#FCEFD5] to-[#fff5e6] h-48 sm:h-52 lg:h-56 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x200?text=Pet+Product";
                    }}
                  />
                </div>

                {/* Product Info - Responsive padding and text sizing */}
                <div className="p-4 sm:p-5 lg:p-6 space-y-2 sm:space-y-2.5 lg:space-y-3">
                  {/* Rating - Responsive text */}
                  <div className="flex items-center gap-1 text-xs sm:text-sm">
                    <FontAwesomeIcon icon={faStar} className="text-[#FFB84C]" />
                    <span className="font-semibold text-[#002A48]">
                      {product.rating}
                    </span>
                    <span className="text-[#555]">(248 reviews)</span>
                  </div>

                  {/* Product name - Scales on different screens */}
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#002A48] group-hover:text-[#FFB84C] transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  {/* Description - Line clamp for consistency */}
                  <p className="text-xs sm:text-sm text-[#555] line-clamp-2">
                    {product.description}
                  </p>

                  {/* Price - Responsive sizing */}
                  <div className="flex items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#FFB84C]">
                      {formatBdt(product.priceBDT)}
                    </span>
                    {product.originalPriceBDT && (
                      <span className="text-sm sm:text-base lg:text-lg text-[#555] line-through">
                        {formatBdt(product.originalPriceBDT)}
                      </span>
                    )}
                  </div>

                  {/* Button - Responsive padding and text */}
                  <button
                    className="w-full bg-[#002A48] text-white py-2.5 sm:py-3 rounded-full font-bold hover:bg-[#013A60] transition-all shadow-md hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const result = await addToCart(product, 1);
                      if (result.success) {
                        alert(`${product.name} added to cart!`);
                      }
                    }}
                  >
                    <span>Add to Cart</span>
                    <FontAwesomeIcon icon={faShoppingCart} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* View All Button */}
<div className="text-center px-4">
  <Link
    to="/products"
    className="group relative bg-[#002A48] text-white px-6 sm:px-10 lg:px-12 py-3 sm:py-3.5 lg:py-4 rounded-full font-bold hover:bg-[#013A60] transition-all shadow-xl hover:shadow-2xl hover:scale-105 overflow-hidden flex items-center justify-center gap-2 mx-auto text-sm sm:text-base w-full sm:w-auto max-w-md"
  >
    <span className="relative z-10">View All Products</span>
    <FontAwesomeIcon icon={faArrowRight} className="relative z-10" />

    {/* Animated gradient */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#FFB84C] to-[#ff9f1c] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
  </Link>
</div>
      </div>
    </section>
  );
};

export default ProductSection;
