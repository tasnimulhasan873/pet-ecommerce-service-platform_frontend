import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "../router/router.jsx";
import AuthProvider from "./Contexts/AuthContext/AuthProvider.jsx";
import CartProvider from "./Contexts/CartContext/CartProvider.jsx";
import WishlistProvider from "./Contexts/WishlistContext/WishlistProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <RouterProvider router={router} />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
