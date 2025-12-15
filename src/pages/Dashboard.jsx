import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faMapMarkerAlt,
  faPhone,
  faCalendarAlt,
  faBox,
  faConciergeBell,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalServices: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        "http://localhost:3000/api/user/profile",
        { email: user?.email }
      );

      if (response.data.success) {
        setProfile(response.data.profile);
        setStats(
          response.data.stats || {
            totalOrders: 0,
            totalServices: 0,
            totalSpent: 0,
          }
        );
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");

      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchDashboardData();
  }, [user, navigate, fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-700 text-xl font-bold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#002A48] mb-2">
            Welcome back, {profile?.name || user?.displayName || "User"}!
          </h1>
          <p className="text-gray-600">
            Manage your account and view your activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-[#002A48]">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="bg-[#FCEFD5] p-4 rounded-full">
                <FontAwesomeIcon
                  icon={faBox}
                  className="text-[#FFB84C] text-2xl"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Active Services
                </p>
                <p className="text-3xl font-bold text-[#002A48]">
                  {stats.totalServices}
                </p>
              </div>
              <div className="bg-[#FCEFD5] p-4 rounded-full">
                <FontAwesomeIcon
                  icon={faConciergeBell}
                  className="text-[#FFB84C] text-2xl"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-1">
                  Total Spent
                </p>
                <p className="text-3xl font-bold text-[#002A48]">
                  ৳{stats.totalSpent.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#FCEFD5] p-4 rounded-full">
                <FontAwesomeIcon
                  icon={faShoppingCart}
                  className="text-[#FFB84C] text-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#002A48] mb-6">
            Profile Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <FontAwesomeIcon
                icon={faUser}
                className="text-[#FFB84C] text-xl mt-1"
              />
              <div>
                <p className="text-gray-600 text-sm font-semibold">Full Name</p>
                <p className="text-[#002A48] font-bold text-lg">
                  {profile?.name || user?.displayName || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-[#FFB84C] text-xl mt-1"
              />
              <div>
                <p className="text-gray-600 text-sm font-semibold">
                  Email Address
                </p>
                <p className="text-[#002A48] font-bold text-lg">
                  {profile?.email || user?.email || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FontAwesomeIcon
                icon={faPhone}
                className="text-[#FFB84C] text-xl mt-1"
              />
              <div>
                <p className="text-gray-600 text-sm font-semibold">
                  Phone Number
                </p>
                <p className="text-[#002A48] font-bold text-lg">
                  {profile?.phone || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="text-[#FFB84C] text-xl mt-1"
              />
              <div>
                <p className="text-gray-600 text-sm font-semibold">Address</p>
                <p className="text-[#002A48] font-bold text-lg">
                  {profile?.address || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="text-[#FFB84C] text-xl mt-1"
              />
              <div>
                <p className="text-gray-600 text-sm font-semibold">
                  Member Since
                </p>
                <p className="text-[#002A48] font-bold text-lg">
                  {profile?.memberSince
                    ? new Date(profile.memberSince).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate("/account-details")}
              className="bg-[#002A48] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#004080] transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={() => navigate("/my-orders")}
              className="bg-gray-200 text-[#002A48] px-8 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
