import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthContext/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faUserMd, faUser, faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const SocialLogin = ({ isRegister = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("customer");
  const { googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      // Firebase Google login
      const result = await googleLogin();
      const user = result.user;

      // Check if user already exists
      const checkResponse = await axios.get(
        `http://localhost:3000/api/users/email/${user.email}`
      );

      if (checkResponse.data && checkResponse.data._id) {
        // Existing user - login directly
        const response = await axios.post(
          "http://localhost:3000/api/auth/social-login",
          {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }
        );

        console.log("Existing user logged in:", response.data.user);

        // Redirect based on user role
        const userRole = response.data.user.role;
        if (userRole === "doctor") {
          navigate("/doctor-dashboard", { replace: true });
        } else if (userRole === "admin") {
          navigate("/admin-dashboard", { replace: true });
        } else {
          const from = location.state?.from?.pathname || "/";
          navigate(from, { replace: true });
        }
      } else {
        // New user - show role selection modal
        setPendingUser(user);
        setShowRoleModal(true);
        setLoading(false);
      }
    } catch (error) {
      // If 404, user doesn't exist - show role modal
      if (error.response?.status === 404) {
        const result = await googleLogin();
        setPendingUser(result.user);
        setShowRoleModal(true);
        setLoading(false);
      } else {
        console.error("Social login error:", error);
        setError(
          error.response?.data?.message || error.message || "Login failed"
        );
        setLoading(false);
      }
    }
  };

  const handleRoleSelection = async (role) => {
    if (!pendingUser) return;

    setLoading(true);
    setError("");

    try {
      // Save user with selected role
      const response = await axios.post(
        "http://localhost:3000/api/auth/social-login",
        {
          email: pendingUser.email,
          displayName: pendingUser.displayName,
          photoURL: pendingUser.photoURL,
          role: role,
        }
      );

      console.log("New user created:", response.data.user);
      setShowRoleModal(false);

      // Redirect based on role
      if (role === "doctor") {
        navigate("/doctor-dashboard", { replace: true });
      } else {
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Role selection error:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to complete registration"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="social-login-container">
        <div className="divider ">
          <span>or continue with</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn-google"
        >
          <FontAwesomeIcon icon={faGoogle} className="google-icon" />
          {loading
            ? "Connecting..."
            : isRegister
            ? "Sign up with Google"
            : "Sign in with Google"}
        </button>

        {error && <div className="error-message google-error">{error}</div>}
      </div>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowRoleModal(false);
                setPendingUser(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Complete Your Registration
            </h2>
            <p className="text-gray-600 mb-6">
              Please select your account type to continue
            </p>

            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelection("customer")}
                disabled={loading}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-primary text-xl"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    Continue as User
                  </h3>
                  <p className="text-sm text-gray-600">
                    Browse products, book appointments, and more
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelection("doctor")}
                disabled={loading}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <FontAwesomeIcon
                    icon={faUserMd}
                    className="text-green-600 text-xl"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    Continue as Doctor
                  </h3>
                  <p className="text-sm text-gray-600">
                    Manage appointments and provide veterinary services
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    ⓘ Requires verification before accessing doctor features
                  </p>
                </div>
              </button>
            </div>

            {loading && (
              <div className="mt-4 text-center text-gray-600">
                Creating your account...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SocialLogin;
