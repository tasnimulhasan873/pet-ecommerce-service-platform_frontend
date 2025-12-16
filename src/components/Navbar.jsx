import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaw,
  faShoppingCart,
  faBars,
  faTimes,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../Contexts/AuthContext/AuthContext.jsx";
import { CartContext } from "../Contexts/CartContext/CartContext.jsx";
import axios from "axios";

const Navbar = ({ userRole: propUserRole, shouldShowHeader }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userRole, setUserRole] = useState(propUserRole);
  const [isVerified, setIsVerified] = useState(true);
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);

  // Update local userRole when prop changes
  useEffect(() => {
    if (propUserRole !== null && propUserRole !== undefined) {
      setUserRole(propUserRole);
    }
  }, [propUserRole]);

  // Fetch user role and verification status when user logs in (fallback if prop not provided)
  useEffect(() => {
    if (propUserRole === null || propUserRole === undefined) {
      const fetchUserRole = async () => {
        if (user && user.email) {
          try {
            const response = await axios.post(
              "http://localhost:3000/api/user/role",
              {
                email: user.email,
              }
            );
            if (response.data.success) {
              setUserRole(response.data.role);
              // Set verification status for doctors
              if (response.data.role === "doctor") {
                setIsVerified(response.data.isVerified !== false);
              }
            }
          } catch (error) {
            console.error("Error fetching user role:", error);
            setUserRole("customer"); // Default to customer on error
          }
        } else {
          setUserRole(null);
        }
      };

      fetchUserRole();
    }
  }, [user, propUserRole]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Adjust Navbar position based on whether Header is shown
  const navTopPosition = shouldShowHeader ? "top-[40px]" : "top-0";

  return (
    <nav
      className={`fixed w-full ${navTopPosition} z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-[#FCEFD5] shadow-lg py-2"
          : "bg-[#FCEFD5] shadow-md py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-[#FFB84C] p-2 rounded-full group-hover:bg-[#002A48] transition-colors duration-300">
              <FontAwesomeIcon
                icon={faPaw}
                className="h-5 w-5 text-[#002A48] group-hover:text-[#FFB84C] transition-colors duration-300"
              />
            </div>
            <span className="text-2xl font-bold text-[#002A48] group-hover:text-[#FFB84C] transition-colors duration-300">
              Puchito
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className="relative text-[#002A48] font-semibold text-sm uppercase tracking-wide px-4 py-2 group"
            >
              <span className="relative z-10 group-hover:text-[#FFB84C] transition-colors duration-300">
                Home
              </span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FFB84C] to-[#ff9f1c] group-hover:w-full transition-all duration-300 ease-out"></span>
              <span className="absolute inset-0 bg-[#FFB84C] opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></span>
            </Link>

            {/* Hide customer navigation for doctor and admin roles */}
            {userRole !== "doctor" &&
              userRole !== "admin" &&
              ["Products", "Services", "Rewards", "Community"].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase()}`}
                  className="relative text-[#002A48] font-semibold text-sm uppercase tracking-wide px-4 py-2 group"
                  title={!user ? `Login required to access ${item}` : ""}
                >
                  <span className="relative z-10 group-hover:text-[#FFB84C] transition-colors duration-300 flex items-center gap-1">
                    {item}
                    {!user && (
                      <span className="text-xs text-orange-500">🔒</span>
                    )}
                  </span>

                  {/* Animated underline */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FFB84C] to-[#ff9f1c] group-hover:w-full transition-all duration-300 ease-out"></span>

                  {/* Hover glow effect */}
                  <span className="absolute inset-0 bg-[#FFB84C] opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></span>
                </Link>
              ))}

            {/* Doctor-specific navigation */}
            {userRole === "doctor" && (
              <>
                <Link
                  to="/doctor-dashboard"
                  className="relative text-[#002A48] font-semibold text-sm uppercase tracking-wide px-4 py-2 group"
                >
                  <span className="relative z-10 group-hover:text-[#FFB84C] transition-colors duration-300">
                    Dashboard
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FFB84C] to-[#ff9f1c] group-hover:w-full transition-all duration-300 ease-out"></span>
                  <span className="absolute inset-0 bg-[#FFB84C] opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></span>
                </Link>
                <Link
                  to="/doctor-appointments"
                  className="relative text-[#002A48] font-semibold text-sm uppercase tracking-wide px-4 py-2 group"
                >
                  <span className="relative z-10 group-hover:text-[#FFB84C] transition-colors duration-300">
                    Appointments
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FFB84C] to-[#ff9f1c] group-hover:w-full transition-all duration-300 ease-out"></span>
                  <span className="absolute inset-0 bg-[#FFB84C] opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></span>
                </Link>
                <Link
                  to="/doctor-profile"
                  className="relative text-[#002A48] font-semibold text-sm uppercase tracking-wide px-4 py-2 group"
                >
                  <span className="relative z-10 group-hover:text-[#FFB84C] transition-colors duration-300">
                    Profile
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FFB84C] to-[#ff9f1c] group-hover:w-full transition-all duration-300 ease-out"></span>
                  <span className="absolute inset-0 bg-[#FFB84C] opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></span>
                </Link>
              </>
            )}

            {/* Admin-specific navigation */}
            {userRole === "admin" && (
              <>
                {[
                  "Dashboard",
                  "Users",
                  "Doctors",
                  "Orders",
                  "Products",
                  "Services",
                  "Payments",
                  "Coupons",
                  "Community",
                ].map((item) => (
                  <Link
                    key={item}
                    to={`/admin-${item.toLowerCase()}`}
                    className="relative text-[#002A48] font-semibold text-sm uppercase tracking-wide px-4 py-2 group"
                  >
                    <span className="relative z-10 group-hover:text-[#FFB84C] transition-colors duration-300">
                      {item}
                    </span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FFB84C] to-[#ff9f1c] group-hover:w-full transition-all duration-300 ease-out"></span>
                    <span className="absolute inset-0 bg-[#FFB84C] opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-300"></span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Button - Hide for doctor and admin roles */}
            {userRole !== "doctor" && userRole !== "admin" && (
              <Link
                to="/cart"
                className="relative text-[#002A48] hover:text-[#FFB84C] p-2.5 rounded-full hover:bg-[#FFB84C]/10 transition-all duration-300 transform hover:scale-110 group"
              >
                <FontAwesomeIcon icon={faShoppingCart} className="h-5 w-5" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FFB84C] text-[#002A48] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            )}

            {/* Auth Section */}
            {user ? (
              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-[#FFB84C]"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-8 h-8 rounded-full bg-[#FFB84C] text-[#002A48] font-bold flex items-center justify-center text-sm ${
                      user.photoURL ? "hidden" : "flex"
                    }`}
                  >
                    {(user.displayName || user.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#002A48] font-medium">
                      Hello, {user.displayName || "User"}
                    </span>
                    {userRole === "doctor" && !isVerified && (
                      <Link
                        to="/doctor-profile"
                        onClick={() => {
                          setTimeout(() => {
                            alert(
                              "Please complete your profile and wait for admin approval."
                            );
                          }, 100);
                        }}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-semibold hover:bg-red-600 transition-colors inline-flex items-center gap-1 mt-1"
                      >
                        <span>⚠</span> Unverified Doctor
                      </Link>
                    )}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-6 py-2.5 font-semibold text-white rounded-full bg-red-500 hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 shadow-md transition-all duration-300 transform hover:scale-105"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden lg:flex items-center gap-2 px-6 py-2.5 font-semibold text-white rounded-full bg-[#002A48] hover:bg-gradient-to-r hover:from-[#FFB84C] hover:to-[#ff9f1c] hover:text-[#002A48] shadow-md transition-all duration-300 transform hover:scale-105"
              >
                <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-[#002A48] hover:text-[#FFB84C] p-2 transition-colors duration-300"
            >
              <FontAwesomeIcon
                icon={isMenuOpen ? faTimes : faBars}
                className="h-5 w-5"
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-3 pb-4 animate-fadeIn">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="relative text-[#002A48] font-semibold text-sm uppercase tracking-wide py-3 px-4 rounded-lg group overflow-hidden"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="relative z-10 group-hover:text-[#FFB84C] transition-colors duration-300">
                  Home
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#FFB84C] to-[#ff9f1c] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 opacity-10"></span>
              </Link>

              {/* Customer navigation - Hide for doctor and admin roles */}
              {userRole !== "doctor" &&
                userRole !== "admin" &&
                ["Products", "Services", "Rewards", "Community"].map((item) => (
                  <Link
                    key={item}
                    to={`/${item.toLowerCase()}`}
                    className="relative text-[#002A48] font-semibold text-sm uppercase tracking-wide py-3 px-4 rounded-lg group overflow-hidden"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="relative z-10 group-hover:text-[#FFB84C] transition-colors duration-300 flex items-center gap-2">
                      {item}
                      {!user && (
                        <span className="text-xs text-orange-500">🔒</span>
                      )}
                    </span>
                    {/* Slide-in background */}
                    <span className="absolute inset-0 bg-gradient-to-r from-[#FFB84C] to-[#ff9f1c] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 opacity-10"></span>
                  </Link>
                ))}

              {/* Doctor-specific mobile navigation */}
              {userRole === "doctor" && (
                <>
                  <Link
                    to="/doctor-dashboard"
                    className="relative text-[#002A48] font-semibold text-sm uppercase tracking-wide py-3 px-4 rounded-lg group overflow-hidden"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="relative z-10 group-hover:text-[#FFB84C] transition-colors duration-300">
                      Dashboard
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#FFB84C] to-[#ff9f1c] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 opacity-10"></span>
                  </Link>
                  <Link
                    to="/doctor-appointments"
                    className="relative text-[#002A48] font-semibold text-sm uppercase tracking-wide py-3 px-4 rounded-lg group overflow-hidden"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="relative z-10 group-hover:text-[#FFB84C] transition-colors duration-300">
                      Appointments
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#FFB84C] to-[#ff9f1c] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 opacity-10"></span>
                  </Link>
                  <Link
                    to="/doctor-profile"
                    className="relative text-[#002A48] font-semibold text-sm uppercase tracking-wide py-3 px-4 rounded-lg group overflow-hidden"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="relative z-10 group-hover:text-[#FFB84C] transition-colors duration-300">
                      Profile
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#FFB84C] to-[#ff9f1c] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 opacity-10"></span>
                  </Link>
                  <Link
                    to="/doctor-payments"
                    className="relative text-[#002A48] font-semibold text-sm uppercase tracking-wide py-3 px-4 rounded-lg group overflow-hidden"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="relative z-10 group-hover:text-[#FFB84C] transition-colors duration-300">
                      Payments
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#FFB84C] to-[#ff9f1c] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 opacity-10"></span>
                  </Link>
                  <Link
                    to="/doctor-settings"
                    className="relative text-[#002A48] font-semibold text-sm uppercase tracking-wide py-3 px-4 rounded-lg group overflow-hidden"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="relative z-10 group-hover:text-[#FFB84C] transition-colors duration-300">
                      Settings
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#FFB84C] to-[#ff9f1c] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 opacity-10"></span>
                  </Link>
                </>
              )}

              {/* Admin-specific mobile navigation */}
              {userRole === "admin" && (
                <>
                  {[
                    "Dashboard",
                    "Users",
                    "Doctors",
                    "Orders",
                    "Products",
                    "Services",
                    "Payments",
                    "Coupons",
                    "Community",
                  ].map((item) => (
                    <Link
                      key={item}
                      to={`/admin-${item.toLowerCase()}`}
                      className="relative text-[#002A48] font-semibold text-sm uppercase tracking-wide py-3 px-4 rounded-lg group overflow-hidden"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="relative z-10 group-hover:text-[#FFB84C] transition-colors duration-300">
                        {item}
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-[#FFB84C] to-[#ff9f1c] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 opacity-10"></span>
                    </Link>
                  ))}
                </>
              )}

              {/* Mobile Auth Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover border-2 border-[#FFB84C]"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-8 h-8 rounded-full bg-[#FFB84C] text-[#002A48] font-bold flex items-center justify-center text-sm ${
                          user.photoURL ? "hidden" : "flex"
                        }`}
                      >
                        {(user.displayName || user.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <span className="text-[#002A48] font-medium">
                        Hello, {user.displayName || "User"}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white rounded-lg bg-red-500 hover:bg-red-600 transition-colors duration-300"
                    >
                      <FontAwesomeIcon
                        icon={faSignOutAlt}
                        className="h-4 w-4"
                      />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white rounded-lg bg-[#002A48] hover:bg-[#FFB84C] hover:text-[#002A48] transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
