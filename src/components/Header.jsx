import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import CustomerHelp from "./CustomerHelp";
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
} from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [query, setQuery] = useState("");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = (query || "").trim();
    if (!trimmed) {
      navigate("/products");
    } else {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    }
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };

    if (isAccountMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAccountMenuOpen]);

  return (
    <header className="bg-white shadow-md fixed top-0 w-full z-[60]">
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

          {/* Center Section - Search Bar */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search products…"
                aria-label="Search products"
                className="w-full pl-12 pr-4 py-1 md:py-3 rounded-full border-2 border-gray-200 focus:border-[#002A48] focus:ring-2 focus:ring-[#002A48] focus:ring-opacity-20 outline-none transition-all text-sm md:text-base"
              />
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
