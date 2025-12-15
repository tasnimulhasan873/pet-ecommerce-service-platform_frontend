# Role-Based Routing Implementation Guide

## Overview

This document provides complete implementation details for role-based routing and navigation in the Pet Platform application.

## 1. Backend Implementation

### API Endpoints Created

#### GET `/api/user/role/:identifier`

Fetch user role by MongoDB ObjectId or email.

**Example Request:**

```bash
GET http://localhost:3000/api/user/role/user@example.com
```

**Response:**

```json
{
  "success": true,
  "role": "customer",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "userName": "John Doe",
    "userEmail": "user@example.com",
    "role": "customer",
    "accountStatus": "active"
  }
}
```

#### POST `/api/user/role`

Alternative endpoint accepting email in request body.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:** Same as GET endpoint

---

### getUserRole() Function

**Location:** `index.js` (lines 570-620)

```javascript
async function getUserRole(identifier) {
  try {
    let user;

    // Find user by ObjectId or email
    if (identifier && ObjectId.isValid(identifier)) {
      user = await usersCollection.findOne({ _id: new ObjectId(identifier) });
    } else if (identifier && identifier.includes("@")) {
      user = await usersCollection.findOne({ userEmail: identifier });
    } else {
      return {
        success: false,
        role: null,
        message: "Invalid user identifier",
      };
    }

    if (!user) {
      return {
        success: false,
        role: null,
        message: "User not found",
      };
    }

    return {
      success: true,
      role: user.role || "customer",
      user: {
        id: user._id,
        userName: user.userName,
        userEmail: user.userEmail,
        role: user.role || "customer",
        accountStatus: user.accountStatus,
      },
    };
  } catch (error) {
    console.error("Error getting user role:", error);
    return {
      success: false,
      role: null,
      message: "Error retrieving user role",
      error: error.message,
    };
  }
}
```

---

## 2. Frontend Implementation

### Updated PrivateRoute Component

**Location:** `src/components/PrivateRoute.jsx`

**Features:**

- Authentication check
- Role-based access control
- Automatic role fetching from backend
- Loading states
- Error handling
- Smart redirects based on role

**Usage Examples:**

```jsx
// Customer-only route
<PrivateRoute allowedRoles={["customer"]}>
  <ProductsPage />
</PrivateRoute>

// Doctor-only route
<PrivateRoute allowedRoles={["doctor"]}>
  <DoctorDashboard />
</PrivateRoute>

// Multiple roles allowed
<PrivateRoute allowedRoles={["customer", "doctor"]}>
  <ProfilePage />
</PrivateRoute>

// Any authenticated user (no role check)
<PrivateRoute>
  <AccountDetails />
</PrivateRoute>
```

---

## 3. Router Configuration

### Role-Based Routes Structure

```jsx
import { createBrowserRouter } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";

// Customer Pages
import HomePage from "../pages/HomePage";
import ProductsPage from "../pages/ProductsPage";
import ServicesPage from "../pages/ServicesPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import Orders from "../pages/Orders";
import MyServices from "../pages/MyServices";
import Dashboard from "../pages/Dashboard";
import AccountDetails from "../pages/AccountDetails";

// Doctor Pages
import DoctorDashboard from "../pages/DoctorDashboard";
import DoctorAppointments from "../pages/DoctorAppointments";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },

  // ========== CUSTOMER ROUTES ==========
  {
    path: "/products",
    element: (
      <PrivateRoute allowedRoles={["customer"]}>
        <ProductsPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/services",
    element: (
      <PrivateRoute allowedRoles={["customer"]}>
        <ServicesPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/cart",
    element: (
      <PrivateRoute allowedRoles={["customer"]}>
        <CartPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/checkout",
    element: (
      <PrivateRoute allowedRoles={["customer"]}>
        <CheckoutPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/my-orders",
    element: (
      <PrivateRoute allowedRoles={["customer"]}>
        <Orders />
      </PrivateRoute>
    ),
  },
  {
    path: "/my-services",
    element: (
      <PrivateRoute allowedRoles={["customer"]}>
        <MyServices />
      </PrivateRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute allowedRoles={["customer"]}>
        <Dashboard />
      </PrivateRoute>
    ),
  },

  // ========== DOCTOR ROUTES ==========
  {
    path: "/doctor-dashboard",
    element: (
      <PrivateRoute allowedRoles={["doctor"]}>
        <DoctorDashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/doctor-appointments",
    element: (
      <PrivateRoute allowedRoles={["doctor"]}>
        <DoctorAppointments />
      </PrivateRoute>
    ),
  },

  // ========== SHARED ROUTES ==========
  {
    path: "/account-details",
    element: (
      <PrivateRoute>
        <AccountDetails />
      </PrivateRoute>
    ),
  },
]);

export default router;
```

---

## 4. Role-Based Navigation

### Custom Hook: useUserRole

Create a reusable hook to fetch and manage user role:

```jsx
// src/hooks/useUserRole.js
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import axios from "axios";

export const useUserRole = () => {
  const { user } = useContext(AuthContext);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.post(
          "http://localhost:3000/api/user/role",
          { email: user.email }
        );

        if (response.data.success) {
          setRole(response.data.role);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error("Error fetching role:", err);
        setError("Failed to fetch user role");
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { role, loading, error };
};
```

### Dynamic Navigation Component

```jsx
// src/components/RoleBasedNav.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useUserRole } from "../hooks/useUserRole";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faBoxOpen,
  faTh,
  faCalendarCheck,
  faUser,
  faDollarSign,
  faCog,
} from "@fortawesome/free-solid-svg-icons";

const RoleBasedNav = () => {
  const { role, loading } = useUserRole();

  if (loading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  // Customer Navigation
  if (role === "customer") {
    return (
      <nav className="space-y-2">
        <Link
          to="/products"
          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FontAwesomeIcon icon={faBoxOpen} className="mr-3" />
          Products
        </Link>
        <Link
          to="/services"
          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FontAwesomeIcon icon={faCalendarCheck} className="mr-3" />
          Services
        </Link>
        <Link
          to="/cart"
          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FontAwesomeIcon icon={faShoppingCart} className="mr-3" />
          Cart
        </Link>
        <Link
          to="/my-orders"
          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FontAwesomeIcon icon={faTh} className="mr-3" />
          My Orders
        </Link>
        <Link
          to="/my-services"
          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FontAwesomeIcon icon={faCalendarCheck} className="mr-3" />
          My Services
        </Link>
        <Link
          to="/account-details"
          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FontAwesomeIcon icon={faUser} className="mr-3" />
          Account Details
        </Link>
      </nav>
    );
  }

  // Doctor Navigation
  if (role === "doctor") {
    return (
      <nav className="space-y-2">
        <Link
          to="/doctor-dashboard"
          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FontAwesomeIcon icon={faTh} className="mr-3" />
          Dashboard
        </Link>
        <Link
          to="/doctor-appointments"
          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FontAwesomeIcon icon={faCalendarCheck} className="mr-3" />
          Appointments
        </Link>
        <Link
          to="/account-details"
          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FontAwesomeIcon icon={faUser} className="mr-3" />
          Profile
        </Link>
        <Link
          to="/doctor-payments"
          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FontAwesomeIcon icon={faDollarSign} className="mr-3" />
          Payments
        </Link>
        <Link
          to="/doctor-settings"
          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FontAwesomeIcon icon={faCog} className="mr-3" />
          Settings
        </Link>
      </nav>
    );
  }

  return null;
};

export default RoleBasedNav;
```

---

## 5. Navbar Integration

### Dynamic Navbar with Role-Based Links

```jsx
// Update Navbar.jsx
import { useUserRole } from "../hooks/useUserRole";

const Navbar = () => {
  const { role } = useUserRole();

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="logo">
        Pet Platform
      </Link>

      {/* Navigation Links */}
      <div className="nav-links">
        {role === "customer" && (
          <>
            <Link to="/products">Products</Link>
            <Link to="/services">Services</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/dashboard">Dashboard</Link>
          </>
        )}

        {role === "doctor" && (
          <>
            <Link to="/doctor-dashboard">Dashboard</Link>
            <Link to="/doctor-appointments">Appointments</Link>
            <Link to="/doctor-profile">Profile</Link>
          </>
        )}
      </div>

      {/* User Menu */}
      <div className="user-menu">{/* ... */}</div>
    </nav>
  );
};
```

---

## 6. Testing Checklist

### Backend Tests

- [x] GET `/api/user/role/:email` returns correct role
- [x] POST `/api/user/role` accepts email in body
- [x] `getUserRole()` handles invalid identifiers
- [x] Returns "customer" as default role if not set

### Frontend Tests

- [ ] PrivateRoute redirects non-authenticated users to /login
- [ ] PrivateRoute blocks customer from doctor routes
- [ ] PrivateRoute blocks doctor from customer routes
- [ ] Role-based navigation shows correct links
- [ ] Loading states display properly
- [ ] Error states handled gracefully

### Role Assignment Tests

```javascript
// Test in MongoDB
db.users.updateOne(
  { userEmail: "doctor@example.com" },
  { $set: { role: "doctor" } }
);

db.users.updateOne(
  { userEmail: "customer@example.com" },
  { $set: { role: "customer" } }
);
```

---

## 7. User Roles in MongoDB

### Default Role Assignment

All new users are assigned `role: "customer"` by default in:

- `/api/auth/register` (manual registration)
- `/api/auth/social-login` (Google/Facebook login)

### Manually Assign Doctor Role

```javascript
// Via MongoDB Compass or Shell
db.users.updateOne(
  { userEmail: "doctor@example.com" },
  { $set: { role: "doctor" } }
);
```

### Admin Script (Optional)

Create an admin endpoint to change roles:

```javascript
// Backend: index.js
app.put("/api/admin/change-role", async (req, res) => {
  try {
    const { userEmail, newRole } = req.body;

    if (!["customer", "doctor"].includes(newRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    await usersCollection.updateOne({ userEmail }, { $set: { role: newRole } });

    res.json({ success: true, message: "Role updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating role" });
  }
});
```

---

## 8. Summary

✅ **Backend:** 2 API endpoints for role fetching  
✅ **Frontend:** Updated PrivateRoute with role checking  
✅ **Pages:** Doctor-specific pages created  
✅ **Navigation:** Dynamic navigation based on role  
✅ **Hooks:** `useUserRole` hook for role management  
✅ **Router:** Role-protected routes configured

**Next Steps:**

1. Update your router file with role-based routes
2. Create `useUserRole` hook
3. Update Navbar with dynamic links
4. Test with both customer and doctor accounts
5. Create remaining doctor pages (payments, settings)
