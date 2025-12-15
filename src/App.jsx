import "./App.css";
import { Outlet } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./Contexts/AuthContext/AuthContext";
import axios from "axios";
import Header from "./components/Header";
import Navbar from "./components/Navbar";

function App() {
  const { user } = useContext(AuthContext);
  const [userRole, setUserRole] = useState(null);

  // Fetch user role when user logs in
  useEffect(() => {
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
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole("customer");
        }
      } else {
        setUserRole(null);
      }
    };

    fetchUserRole();
  }, [user]);

  // Determine if Header should be shown
  const shouldShowHeader = userRole !== "admin" && userRole !== "doctor";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hide Header for admin and doctor roles */}
      {shouldShowHeader && <Header />}
      <Navbar userRole={userRole} shouldShowHeader={shouldShowHeader} />
      <main className={shouldShowHeader ? "pt-[25px]" : ""}>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
