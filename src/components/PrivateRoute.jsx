import { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext/AuthContext.jsx";
import axios from "axios";

/**
 * PrivateRoute Component - Role-Based Access Control
 *
 * @param {ReactNode} children - Child components to render if authorized
 * @param {string[]} allowedRoles - Array of roles allowed to access this route
 *                                  Example: ["customer"], ["doctor"], ["customer", "doctor"]
 *
 * Behavior:
 * 1. If user is not logged in → Redirect to /login
 * 2. If allowedRoles is defined:
 *    - Fetch user role from backend
 *    - If user role is NOT in allowedRoles → Redirect to appropriate dashboard
 * 3. If authorized → Render children
 *
 * Usage:
 * <PrivateRoute allowedRoles={["customer"]}>
 *   <ProductsPage />
 * </PrivateRoute>
 */
const PrivateRoute = ({ children, allowedRoles = null }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const [roleChecking, setRoleChecking] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [roleError, setRoleError] = useState(false);

  // Fetch user role from backend when allowedRoles is specified
  useEffect(() => {
    const fetchUserRole = async () => {
      // Skip role check if no allowedRoles specified
      if (!allowedRoles || allowedRoles.length === 0 || !user) {
        return;
      }

      try {
        setRoleChecking(true);
        setRoleError(false);

        const response = await axios.post(
          "http://localhost:3000/api/user/role",
          { email: user.email }
        );

        if (response.data.success) {
          setUserRole(response.data.role);
        } else {
          console.error("Failed to fetch user role:", response.data.message);
          setRoleError(true);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRoleError(true);
      } finally {
        setRoleChecking(false);
      }
    };

    fetchUserRole();
  }, [user, allowedRoles]);

  // Loading state - show spinner while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is specified, check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    // Still checking role from backend
    if (roleChecking) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">Verifying access...</p>
          </div>
        </div>
      );
    }

    // Error fetching role - show error message
    if (roleError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-red-800 mb-2">
                Access Error
              </h2>
              <p className="text-red-600 mb-4">
                Unable to verify your account permissions. Please try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Role fetched - check if user has permission
    if (userRole && !allowedRoles.includes(userRole)) {
      // Redirect based on role
      const redirectPath = userRole === "doctor" ? "/doctor-dashboard" : "/";

      return (
        <Navigate
          to={redirectPath}
          state={{
            from: location,
            message: "You don't have permission to access this page",
          }}
          replace
        />
      );
    }
  }

  // All checks passed - render children
  return children;
};

export default PrivateRoute;
