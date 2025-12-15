import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import { formatBdt } from "../utils/currency";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faCalendarAlt,
  faCreditCard,
  faCheckCircle,
  faClock,
  faTruck,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, processing, completed, cancelled

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        "http://localhost:3000/api/orders/my-orders",
        { userEmail: user?.email }
      );

      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to load orders");

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

    fetchOrders();
  }, [user, navigate, fetchOrders]);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
        );
      case "processing":
        return <FontAwesomeIcon icon={faClock} className="text-yellow-500" />;
      case "shipped":
        return <FontAwesomeIcon icon={faTruck} className="text-blue-500" />;
      case "cancelled":
        return (
          <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />
        );
      default:
        return <FontAwesomeIcon icon={faBox} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-yellow-100 text-yellow-700";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.orderStatus?.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
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
            onClick={fetchOrders}
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
          <h1 className="text-4xl font-bold text-[#002A48] mb-2">My Orders</h1>
          <p className="text-gray-600">View and track all your orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-2 mb-8 flex flex-wrap gap-2">
          {["all", "processing", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === status
                  ? "bg-[#002A48] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FontAwesomeIcon
              icon={faBox}
              className="text-gray-300 text-6xl mb-4"
            />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No Orders Found
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === "all"
                ? "You haven't placed any orders yet."
                : `No ${filter} orders found.`}
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-[#002A48] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#004080] transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="bg-gradient-to-r from-[#002A48] to-[#004080] text-white p-6">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="text-sm opacity-90 mb-1">Order ID</p>
                      <p className="font-bold text-lg">
                        #{order._id?.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90 mb-1">Order Date</p>
                      <p className="font-bold">
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="mr-2"
                        />
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90 mb-1">Total Amount</p>
                      <p className="font-bold text-xl">
                        {formatBdt(order.totalBDT)}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {getStatusIcon(order.orderStatus)}
                        {order.orderStatus || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="font-bold text-[#002A48] mb-3">
                      Order Items
                    </h4>
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-[#002A48]">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#FFB84C]">
                              {formatBdt(item.priceBDT * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <FontAwesomeIcon icon={faCreditCard} />
                    <span>Payment Method: {order.paymentMethod || "Card"}</span>
                    <span
                      className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${
                        order.paymentStatus === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.paymentStatus || "Pending"}
                    </span>
                  </div>

                  {/* Shipping Address */}
                  {order.billingDetails && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-semibold text-[#002A48] mb-2">
                        Shipping Address
                      </p>
                      <p className="text-gray-700">
                        {order.billingDetails.fullName}
                        <br />
                        {order.billingDetails.address}
                        <br />
                        {order.billingDetails.city}, {order.billingDetails.zip}
                        <br />
                        Phone: {order.billingDetails.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
