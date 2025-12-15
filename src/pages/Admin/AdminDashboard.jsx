import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserMd,
  faShoppingBag,
  faDollarSign,
  faCalendarCheck,
  faTicketAlt,
  faComments,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalAppointments: 0,
    activeCoupons: 0,
    communityPosts: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:3000/api/admin/dashboard-stats"
        );

        if (response.data.success) {
          setStats(response.data.stats);
          setRecentActivity(response.data.recentActivity || []);
        }
      } catch (error) {
        console.error("Error fetching admin dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: faUsers,
      color: "from-blue-500 to-blue-600",
      path: "/admin-users",
    },
    {
      title: "Total Doctors",
      value: stats.totalDoctors,
      icon: faUserMd,
      color: "from-green-500 to-green-600",
      path: "/admin-doctors",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: faShoppingBag,
      color: "from-purple-500 to-purple-600",
      path: "/admin-orders",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: faDollarSign,
      color: "from-yellow-500 to-yellow-600",
      path: "/admin-payments",
    },
    {
      title: "Appointments",
      value: stats.totalAppointments,
      icon: faCalendarCheck,
      color: "from-pink-500 to-pink-600",
      path: "/admin-services",
    },
    {
      title: "Active Coupons",
      value: stats.activeCoupons,
      icon: faTicketAlt,
      color: "from-indigo-500 to-indigo-600",
      path: "/admin-coupons",
    },
    {
      title: "Community Posts",
      value: stats.communityPosts,
      icon: faComments,
      color: "from-teal-500 to-teal-600",
      path: "/admin-community",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: faChartLine,
      color: "from-red-500 to-red-600",
      path: "/admin-users",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#002A48] mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome to the admin control panel. Manage your entire platform.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, idx) => (
            <div
              key={idx}
              onClick={() => navigate(stat.path)}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <FontAwesomeIcon icon={stat.icon} className="text-2xl" />
                </div>
              </div>
              <h3 className="text-sm font-semibold mb-1 opacity-90">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => navigate("/admin-users")}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all text-left"
          >
            <FontAwesomeIcon
              icon={faUsers}
              className="text-3xl text-blue-500 mb-3"
            />
            <h3 className="text-lg font-bold text-[#002A48] mb-2">
              Manage Users
            </h3>
            <p className="text-gray-600 text-sm">
              View, edit, and manage user accounts
            </p>
          </button>

          <button
            onClick={() => navigate("/admin-doctors")}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all text-left"
          >
            <FontAwesomeIcon
              icon={faUserMd}
              className="text-3xl text-green-500 mb-3"
            />
            <h3 className="text-lg font-bold text-[#002A48] mb-2">
              Manage Doctors
            </h3>
            <p className="text-gray-600 text-sm">
              Approve and manage doctor profiles
            </p>
          </button>

          <button
            onClick={() => navigate("/admin-orders")}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all text-left"
          >
            <FontAwesomeIcon
              icon={faShoppingBag}
              className="text-3xl text-purple-500 mb-3"
            />
            <h3 className="text-lg font-bold text-[#002A48] mb-2">
              View Orders
            </h3>
            <p className="text-gray-600 text-sm">Track and manage all orders</p>
          </button>

          <button
            onClick={() => navigate("/admin-coupons")}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all text-left"
          >
            <FontAwesomeIcon
              icon={faTicketAlt}
              className="text-3xl text-indigo-500 mb-3"
            />
            <h3 className="text-lg font-bold text-[#002A48] mb-2">
              Manage Coupons
            </h3>
            <p className="text-gray-600 text-sm">
              Create and manage discount coupons
            </p>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-[#002A48] mb-4">
            Recent Activity
          </h2>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No recent activity to display
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-[#002A48]">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600">{activity.details}</p>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
