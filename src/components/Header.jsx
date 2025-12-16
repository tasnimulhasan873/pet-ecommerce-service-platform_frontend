import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import CustomerHelp from "./CustomerHelp";
import { getAllProducts } from "../api/productsAPI";
import { formatBdt } from "../utils/currency";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUser,
  faHeadset,
  faShoppingCart,
  faPaw,
  faChevronDown,
  faTachometerAlt,
  faBox,
  faConciergeBell,
  faUserCircle,
  faSignOutAlt,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [query, setQuery] = useState("");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Fetch all products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts();
        if (response.success) {
          setAllProducts(response.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Search products with debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length > 0) {
        performSearch(query);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, allProducts]);

  const performSearch = (searchQuery) => {
    setIsSearching(true);
    const lowerQuery = searchQuery.toLowerCase().trim();

    const filtered = allProducts
      .filter((product) => {
        const nameMatch = product.name?.toLowerCase().includes(lowerQuery);
        const descMatch = product.description
          ?.toLowerCase()
          .includes(lowerQuery);
        const brandMatch = product.brand?.toLowerCase().includes(lowerQuery);
        const tagsMatch = product.tags?.some((tag) =>
          tag.toLowerCase().includes(lowerQuery)
        );
        return nameMatch || descMatch || brandMatch || tagsMatch;
      })
      .slice(0, 5); // Show top 5 results

    setSearchResults(filtered);
    setShowSearchResults(filtered.length > 0);
    setIsSearching(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = (query || "").trim();
    setShowSearchResults(false);
    if (!trimmed) {
      navigate("/products");
    } else {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleProductClick = (productId) => {
    setQuery("");
    setShowSearchResults(false);
    navigate(`/product/${productId}`);
  };

  const handleViewAllResults = () => {
    setShowSearchResults(false);
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleLogout = async () => {
    try {
      // Firebase logout
      await logout();
      setIsAccountMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    if (isAccountMenuOpen || showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAccountMenuOpen, showSearchResults]);

  return (
    <header className="bg-white shadow-md fixed top-0 w-full z-[60] py-2  sm:py-0">
      <div className="max-w-7xl mx-auto px-4 ">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <FontAwesomeIcon
              icon={faPaw}
              className="text-[#002A48] text-2xl md:text-3xl"
            />
            <span className="text-xl md:text-2xl font-bold text-[#002A48] hidden sm:block">
              Puhcito.com
            </span>
          </Link>
          <form
            onSubmit={handleSubmit}
            className="flex-1 max-w-2xl mx-4 relative"
            ref={searchRef}
          >
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && setShowSearchResults(true)}
                type="text"
                placeholder="Search products…"
                aria-label="Search products"
                className="w-full pl-12 pr-10 py-1 md:py-3 rounded-full border-2 border-gray-200 focus:border-[#002A48] focus:ring-2 focus:ring-[#002A48] focus:ring-opacity-20 outline-none transition-all text-sm md:text-base"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FFB84C] mx-auto mb-2"></div>
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-xs text-gray-500 font-semibold">
                          {searchResults.length}{" "}
                          {searchResults.length === 1 ? "result" : "results"}{" "}
                          found
                        </p>
                      </div>
                      {searchResults.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => handleProductClick(product._id)}
                          className="p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            {/* Product Image */}
                            <img
                              src={
                                product.images?.[0] ||
                                "https://via.placeholder.com/80"
                              }
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/80?text=Product";
                              }}
                            />

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-[#002A48] mb-1 line-clamp-1">
                                {product.name}
                              </h4>
                              <p className="text-xs text-gray-500 line-clamp-1 mb-1">
                                {product.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#002A48]">
                                  {formatBdt(product.priceBDT)}
                                </span>
                                {product.brand && (
                                  <span className="text-xs text-[#FFB84C] font-medium">
                                    • {product.brand}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Arrow Icon */}
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className="text-gray-400 transform -rotate-90"
                            />
                          </div>
                        </div>
                      ))}

                      {/* View All Results Button */}
                      <div className="p-3 bg-gray-50 border-t border-gray-200">
                        <button
                          onClick={handleViewAllResults}
                          className="w-full py-2 bg-[#002A48] text-white rounded-lg hover:bg-[#FFB84C] hover:text-[#002A48] transition-colors font-semibold text-sm"
                        >
                          View All Results for "{query}"
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="text-4xl mb-3">🔍</div>
                      <p className="text-gray-600 font-medium mb-1">
                        No products found
                      </p>
                      <p className="text-sm text-gray-500">
                        Try different keywords
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>

          {/* Right Section - Icons/Menu */}
          <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
            {/* My Account Dropdown */}
            <div className="relative" ref={dropdownRef}>
              {user ? (
                <>
                  <button
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className="flex items-center gap-2 text-[#002A48] hover:text-[#FFB84C] transition-colors group"
                  >
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-lg md:text-xl"
                    />
                    <span className="hidden lg:block text-sm font-semibold group-hover:text-[#FFB84C]">
                      My Account
                    </span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`hidden lg:block text-xs transition-transform ${
                        isAccountMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isAccountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#FCEFD5] hover:text-[#002A48] transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={faTachometerAlt}
                          className="text-[#FFB84C]"
                        />
                        <span className="font-semibold">Dashboard</span>
                      </Link>
                      <Link
                        to="/my-orders"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#FCEFD5] hover:text-[#002A48] transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={faBox}
                          className="text-[#FFB84C]"
                        />
                        <span className="font-semibold">Orders</span>
                      </Link>
                      <Link
                        to="/my-services"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#FCEFD5] hover:text-[#002A48] transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={faConciergeBell}
                          className="text-[#FFB84C]"
                        />
                        <span className="font-semibold">Services</span>
                      </Link>
                      <Link
                        to="/account-details"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#FCEFD5] hover:text-[#002A48] transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={faUserCircle}
                          className="text-[#FFB84C]"
                        />
                        <span className="font-semibold">Account Details</span>
                      </Link>
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span className="font-semibold">Logout</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-[#002A48] hover:text-[#FFB84C] transition-colors group"
                >
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-lg md:text-xl"
                  />
                  <span className="hidden lg:block text-sm font-semibold group-hover:text-[#FFB84C]">
                    Login
                  </span>
                </Link>
              )}
            </div>

            {/* Customer Help */}
            <button
              onClick={() => setIsHelpOpen(true)}
              className="flex items-center gap-2 text-[#002A48] hover:text-[#FFB84C] transition-colors group"
            >
              <FontAwesomeIcon
                icon={faHeadset}
                className="text-lg md:text-xl"
              />
              <span className="hidden lg:block text-sm font-semibold group-hover:text-[#FFB84C]">
                Customer Help
              </span>
            </button>

            {/* Checkout */}
            <Link
              to="/cart"
              className="flex items-center gap-2 text-[#002A48] hover:text-[#FFB84C] transition-colors group relative"
            >
              <FontAwesomeIcon
                icon={faShoppingCart}
                className="text-lg md:text-xl"
              />
              <span className="hidden lg:block text-sm font-semibold group-hover:text-[#FFB84C]">
                Checkout
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Customer Help Modal */}
      <CustomerHelp isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </header>
  );
};

export default Header;
