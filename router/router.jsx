import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../src/App.jsx";
import HomePage from "../src/pages/HomePage.jsx";
import ProductsPage from "../src/pages/ProductsPage.jsx";
import ServicesPage from "../src/pages/ServicesPage.jsx";
import RewardsPage from "../src/pages/RewardsPage.jsx";
import CommunityPage from "../src/pages/CommunityPage.jsx";
import CartPage from "../src/pages/CartPage.jsx";
import CheckoutPage from "../src/pages/CheckoutPage.jsx";
import PaymentSuccess from "../src/pages/PaymentSuccess.jsx";
import AppointmentSuccess from "../src/pages/AppointmentSuccess.jsx";
import Login from "../src/components/Authentication/Login.jsx";
import Register from "../src/components/Authentication/Register.jsx";
import PrivateRoute from "../src/components/PrivateRoute.jsx";
import ProductDetails from "../src/components/ProductDetails.jsx";
import DoctorDetails from "../src/pages/DoctorDetails.jsx";

// Customer Pages
import Dashboard from "../src/pages/Dashboard.jsx";
import Orders from "../src/pages/Orders.jsx";
import MyServices from "../src/pages/MyServices.jsx";
import AccountDetails from "../src/pages/AccountDetails.jsx";

// Doctor Pages
import DoctorDashboard from "../src/pages/DoctorDashboard.jsx";
import DoctorAppointments from "../src/pages/DoctorAppointments.jsx";
import DoctorProfile from "../src/pages/DoctorProfile.jsx";
import DoctorPayments from "../src/pages/DoctorPayments.jsx";
import DoctorSettings from "../src/pages/DoctorSettings.jsx";

// Admin Pages
import AdminDashboard from "../src/pages/Admin/AdminDashboard.jsx";
import ManageUsers from "../src/pages/Admin/ManageUsers.jsx";
import ManageDoctors from "../src/pages/Admin/ManageDoctors.jsx";
import ManageOrders from "../src/pages/Admin/ManageOrders.jsx";
import ManageServices from "../src/pages/Admin/ManageServices.jsx";
import AdminPayments from "../src/pages/Admin/AdminPayments.jsx";
import AdminCoupons from "../src/pages/Admin/AdminCoupons.jsx";
import AdminCommunity from "../src/pages/Admin/AdminCommunity.jsx";
import AdminProducts from "../src/pages/Admin/AdminProducts.jsx";
import AdminAddProduct from "../src/pages/Admin/AdminAddProduct.jsx";
import AdminEditProduct from "../src/pages/Admin/AdminEditProduct.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      // ========== CUSTOMER ROUTES ==========
      {
        path: "products",
        element: (
          <PrivateRoute allowedRoles={["customer"]}>
            <ProductsPage />
          </PrivateRoute>
        ),
      },
      {
        path: "product/:id",
        element: (
          <PrivateRoute allowedRoles={["customer"]}>
            <ProductDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "services",
        element: (
          <PrivateRoute allowedRoles={["customer"]}>
            <ServicesPage />
          </PrivateRoute>
        ),
      },
      {
        path: "doctor/:doctorId",
        element: (
          <PrivateRoute allowedRoles={["customer"]}>
            <DoctorDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "rewards",
        element: (
          <PrivateRoute allowedRoles={["customer"]}>
            <RewardsPage />
          </PrivateRoute>
        ),
      },
      {
        path: "community",
        // Community page is now public - accessible without login
        element: <CommunityPage />,
      },
      {
        path: "cart",
        element: (
          <PrivateRoute allowedRoles={["customer"]}>
            <CartPage />
          </PrivateRoute>
        ),
      },
      {
        path: "checkout",
        element: (
          <PrivateRoute allowedRoles={["customer"]}>
            <CheckoutPage />
          </PrivateRoute>
        ),
      },
      {
        path: "payment-success",
        element: (
          <PrivateRoute allowedRoles={["customer"]}>
            <PaymentSuccess />
          </PrivateRoute>
        ),
      },
      {
        path: "appointment-success",
        element: (
          <PrivateRoute allowedRoles={["customer"]}>
            <AppointmentSuccess />
          </PrivateRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <PrivateRoute allowedRoles={["customer"]}>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: "my-orders",
        element: (
          <PrivateRoute allowedRoles={["customer"]}>
            <Orders />
          </PrivateRoute>
        ),
      },
      {
        path: "my-services",
        element: (
          <PrivateRoute allowedRoles={["customer"]}>
            <MyServices />
          </PrivateRoute>
        ),
      },

      // ========== DOCTOR ROUTES ==========
      {
        path: "doctor-dashboard",
        element: (
          <PrivateRoute allowedRoles={["doctor"]}>
            <DoctorDashboard />
          </PrivateRoute>
        ),
      },
      {
        path: "doctor-appointments",
        element: (
          <PrivateRoute allowedRoles={["doctor"]}>
            <DoctorAppointments />
          </PrivateRoute>
        ),
      },
      {
        path: "doctor-profile",
        element: (
          <PrivateRoute allowedRoles={["doctor"]}>
            <DoctorProfile />
          </PrivateRoute>
        ),
      },
      {
        path: "doctor-payments",
        element: (
          <PrivateRoute allowedRoles={["doctor"]}>
            <DoctorPayments />
          </PrivateRoute>
        ),
      },
      {
        path: "doctor-settings",
        element: (
          <PrivateRoute allowedRoles={["doctor"]}>
            <DoctorSettings />
          </PrivateRoute>
        ),
      },

      // ========== ADMIN ROUTES ==========
      {
        path: "admin-dashboard",
        element: (
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        ),
      },
      {
        path: "admin-users",
        element: (
          <PrivateRoute allowedRoles={["admin"]}>
            <ManageUsers />
          </PrivateRoute>
        ),
      },
      {
        path: "admin-doctors",
        element: (
          <PrivateRoute allowedRoles={["admin"]}>
            <ManageDoctors />
          </PrivateRoute>
        ),
      },
      {
        path: "admin-orders",
        element: (
          <PrivateRoute allowedRoles={["admin"]}>
            <ManageOrders />
          </PrivateRoute>
        ),
      },
      {
        path: "admin-services",
        element: (
          <PrivateRoute allowedRoles={["admin"]}>
            <ManageServices />
          </PrivateRoute>
        ),
      },
      {
        path: "admin-payments",
        element: (
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminPayments />
          </PrivateRoute>
        ),
      },
      {
        path: "admin-coupons",
        element: (
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminCoupons />
          </PrivateRoute>
        ),
      },
      {
        path: "admin-community",
        element: (
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminCommunity />
          </PrivateRoute>
        ),
      },
      {
        path: "admin-products",
        element: (
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminProducts />
          </PrivateRoute>
        ),
      },
      {
        path: "admin-products/add",
        element: (
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminAddProduct />
          </PrivateRoute>
        ),
      },
      {
        path: "admin-products/edit/:id",
        element: (
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminEditProduct />
          </PrivateRoute>
        ),
      },

      // ========== SHARED ROUTES ==========
      {
        path: "account-details",
        element: (
          <PrivateRoute>
            <AccountDetails />
          </PrivateRoute>
        ),
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
