import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faShoppingCart,
  faHeart,
  faTruck,
  faUndo,
  faShield,
  faArrowLeft,
  faMinus,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { formatBdt } from "../utils/currency";
import { CartContext } from "../Contexts/CartContext/CartContext";
import { getProductById } from "../api/productsAPI";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await getProductById(id);
        if (response.success && response.product) {
          const productData = response.product;
          const transformedProduct = {
            id: productData._id,
            name: productData.name,
            priceUSD: productData.priceUSD,
            priceBDT: productData.priceBDT,
            originalPriceUSD: productData.originalPriceUSD || null,
            originalPriceBDT: productData.originalPriceBDT || null,
            images: productData.images || ["https://via.placeholder.com/600"],
            description: productData.description,
            rating: productData.rating || 4.5,
            reviews: productData.reviews || 0,
            brand: productData.brand,
            tags: productData.tags || [],
            status: productData.status || "available",
            stock: productData.stock || 0,
            inStock:
              productData.status === "available" && productData.stock > 0,
          };
          setProduct(transformedProduct);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleQuantityChange = (action) => {
    if (action === "increase") {
      setQuantity((prev) => prev + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      const result = await addToCart(product, quantity);
      if (result && result.success) {
        // simple feedback; could be replaced with toast/notification
        alert(`${product.name} (${quantity}) added to cart`);
      } else {
        console.error("Add to cart failed:", result);
        alert(result?.message || "Failed to add item to cart");
      }
    } catch (err) {
      console.error("Error in handleAddToCart:", err);
      alert("Failed to add item to cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-28 flex items-center justify-center">
        <div className="loading-spinner"></div>
        <p className="ml-4 text-[#002A48]">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white pt-28 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#002A48] mb-4">
            Product Not Found
          </h2>
          <button
            onClick={() => navigate("/products")}
            className="bg-[#FFB84C] text-[#002A48] px-6 py-3 rounded-full font-semibold hover:bg-[#ff9f1c] transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-28">
      <div className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#002A48] hover:text-[#FFB84C] transition-colors mb-6 group"
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-medium">Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="bg-gradient-to-br from-[#FCEFD5] to-[#fff5e6] rounded-2xl overflow-hidden aspect-square">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/600x600?text=Pet+Product";
                }}
              />
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-[#FFB84C] ring-2 ring-[#FFB84C]/30"
                      : "border-gray-200 hover:border-[#FFB84C]"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/80x80?text=Pet";
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Product Info */}
          <div className="space-y-6">
            {/* Product Title & Rating */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#FFB84C] text-[#002A48] px-3 py-1 rounded-full text-sm font-semibold">
                  {product.brand}
                </span>
                {!product.inStock && (
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                    Out of Stock
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-[#002A48] mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className={`text-sm ${
                        i < Math.floor(product.rating)
                          ? "text-[#FFB84C]"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-[#002A48]">
                  {product.rating}
                </span>
                <span className="text-gray-500">
                  ({product.reviews} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-[#FFB84C]">
                {formatBdt(product.priceBDT)}
              </span>
              {product.originalPriceBDT && (
                <span className="text-xl text-gray-500 line-through">
                  {formatBdt(product.originalPriceBDT)}
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm capitalize"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-[#002A48]">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange("decrease")}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <FontAwesomeIcon icon={faMinus} className="text-sm" />
                  </button>
                  <span className="px-4 py-2 font-semibold min-w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange("increase")}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-sm" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 py-4 px-6 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                    product.inStock
                      ? "bg-[#002A48] text-white hover:bg-[#334155] hover:scale-105 shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </button>
                <button className="p-4 border-2 border-gray-200 rounded-full hover:border-red-300 hover:bg-red-50 transition-colors group">
                  <FontAwesomeIcon
                    icon={faHeart}
                    className="text-gray-400 group-hover:text-red-500"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              {["description", "shipping", "returns"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-semibold capitalize transition-colors ${
                    activeTab === tab
                      ? "border-[#FFB84C] text-[#FFB84C]"
                      : "border-transparent text-gray-500 hover:text-[#002A48]"
                  }`}
                >
                  {tab === "shipping" ? "Shipping & Delivery" : tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <h3 className="text-2xl font-bold text-[#002A48] mb-4">
                  Product Description
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-[#002A48] mb-6">
                  Shipping & Delivery
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                    <FontAwesomeIcon
                      icon={faTruck}
                      className="text-[#FFB84C] text-xl mt-1"
                    />
                    <div>
                      <h4 className="font-semibold text-[#002A48] mb-2">
                        Free Shipping
                      </h4>
                      <p className="text-gray-600">On orders over ৳6,000</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                    <FontAwesomeIcon
                      icon={faShield}
                      className="text-[#FFB84C] text-xl mt-1"
                    />
                    <div>
                      <h4 className="font-semibold text-[#002A48] mb-2">
                        Secure Delivery
                      </h4>
                      <p className="text-gray-600">2-5 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                    <FontAwesomeIcon
                      icon={faUndo}
                      className="text-[#FFB84C] text-xl mt-1"
                    />
                    <div>
                      <h4 className="font-semibold text-[#002A48] mb-2">
                        Easy Returns
                      </h4>
                      <p className="text-gray-600">30-day return policy</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "returns" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-[#002A48] mb-6">
                  Return Policy
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <span className="text-[#FFB84C] font-bold">•</span>
                      <span>30-day return window from date of delivery</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#FFB84C] font-bold">•</span>
                      <span>
                        Items must be unopened and in original packaging
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#FFB84C] font-bold">•</span>
                      <span>Free return shipping for defective items</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#FFB84C] font-bold">•</span>
                      <span>Refunds processed within 3-5 business days</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
