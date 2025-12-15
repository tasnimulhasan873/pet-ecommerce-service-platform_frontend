import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingBag,
  faSearch,
  faFilter,
  faCheck,
  faTruck,
  faBox,
  faTimes,
  faCheckCircle,
  faHourglassHalf,
  faShippingFast,
  faBan,
} from "@fortawesome/free-solid-svg-icons";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:3000/api/admin/all-orders"
      );
      if (response.data.success) {
        const ordersData =
          response.data.orders ||
          response.data.data ||
          response.data?.ordersList ||
          response.data ||
          [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to mark this order as ${newStatus}?`
      )
    )
      return;

    try {
      const response = await axios.put(
        `http://localhost:3000/api/admin/orders/${orderId}/status`,
        { status: newStatus }
      );

      if (response.data.success) {
        alert("Order status updated successfully");
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const q = (searchTerm || "").toString().toLowerCase();
    // Search in order ID, customer email, and customer name
    const searchableText = [
      order.orderId,
      order._id,
      order.userEmail,
      order.customerName,
      order.billingDetails && order.billingDetails.fullName,
    ]
      .filter(Boolean)
      .map(String)
      .join(" ")
      .toLowerCase();

    const matchesSearch = q === "" || searchableText.includes(q);
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return faHourglassHalf;
      case "processing":
        return faBox;
      case "shipped":
        return faShippingFast;
      case "delivered":
        return faCheckCircle;
      case "cancelled":
        return faBan;
      default:
        return faHourglassHalf;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#002A48] mb-2 flex items-center">
                <div className="bg-gradient-to-br from-[#002A48] to-[#004080] p-4 rounded-xl mr-4 shadow-lg">
                  <FontAwesomeIcon
                    icon={faShoppingBag}
                    className="text-white text-2xl"
                  />
                </div>
                Manage Orders
              </h1>
              <p className="text-gray-600 ml-20">
                View and manage all orders • {filteredOrders.length} total
                orders
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[
            {
              label: "All",
              count: orders.length,
              color: "bg-gray-500",
              status: "all",
            },
            {
              label: "Pending",
              count: orders.filter((o) => !o.status || o.status === "pending")
                .length,
              color: "bg-yellow-500",
              status: "pending",
            },
            {
              label: "Processing",
              count: orders.filter((o) => o.status === "processing").length,
              color: "bg-purple-500",
              status: "processing",
            },
            {
              label: "Shipped",
              count: orders.filter((o) => o.status === "shipped").length,
              color: "bg-blue-500",
              status: "shipped",
            },
            {
              label: "Delivered",
              count: orders.filter((o) => o.status === "delivered").length,
              color: "bg-green-500",
              status: "delivered",
            },
          ].map((stat) => (
            <div
              key={stat.status}
              onClick={() => setFilterStatus(stat.status)}
              className={`bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                filterStatus === stat.status
                  ? "ring-4 ring-[#FFB84C] ring-opacity-50"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-[#002A48] mt-1">
                    {stat.count}
                  </p>
                </div>
                <div
                  className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center`}
                >
                  <FontAwesomeIcon
                    icon={getStatusIcon(stat.status)}
                    className="text-white text-xl"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="mr-2 text-[#FFB84C]"
                />
                Search Orders
              </label>
              <input
                type="text"
                placeholder="Search by order ID, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FFB84C] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FontAwesomeIcon
                  icon={faFilter}
                  className="mr-2 text-[#FFB84C]"
                />
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FFB84C] focus:outline-none transition-colors bg-white"
              >
                <option value="all">All Orders</option>
                <option value="pending">⏳ Pending</option>
                <option value="processing">📦 Processing</option>
                <option value="shipped">🚚 Shipped</option>
                <option value="delivered">✅ Delivered</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#002A48] to-[#004080] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Customer Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">
                    Quick Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order, index) => (
                  <tr
                    key={order._id}
                    className={`hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 font-bold text-[#002A48]">
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faShoppingBag}
                          className="mr-2 text-[#FFB84C]"
                        />
                        #
                        {order.orderId ||
                          (order._id ? String(order._id).slice(-8) : "—")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-semibold">
                          {order.billingDetails?.fullName ||
                            order.customerName ||
                            order.userEmail?.split("@")[0] ||
                            "Unknown"}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {order.userEmail}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">
                      ${order.totalUSD?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold shadow-md ${
                          order.status === "delivered"
                            ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                            : order.status === "cancelled"
                            ? "bg-gradient-to-r from-red-400 to-red-600 text-white"
                            : order.status === "shipped"
                            ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                            : order.status === "processing"
                            ? "bg-gradient-to-r from-purple-400 to-purple-600 text-white"
                            : "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={getStatusIcon(order.status || "pending")}
                          className="mr-2"
                        />
                        {order.status?.toUpperCase() || "PENDING"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center items-center flex-wrap">
                        {order.status !== "delivered" &&
                        order.status !== "cancelled" ? (
                          <>
                            {(!order.status || order.status === "pending") && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(order._id, "processing")
                                }
                                className="group relative px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                title="Start Processing"
                              >
                                <FontAwesomeIcon
                                  icon={faBox}
                                  className="mr-1"
                                />
                                Process
                              </button>
                            )}
                            {order.status === "processing" && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(order._id, "shipped")
                                }
                                className="group relative px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                title="Mark as Shipped"
                              >
                                <FontAwesomeIcon
                                  icon={faTruck}
                                  className="mr-1"
                                />
                                Ship
                              </button>
                            )}
                            {(order.status === "shipped" ||
                              order.status === "processing") && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(order._id, "delivered")
                                }
                                className="group relative px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                title="Mark as Delivered"
                              >
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className="mr-1"
                                />
                                Deliver
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleStatusUpdate(order._id, "cancelled")
                              }
                              className="group relative px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                              title="Cancel Order"
                            >
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="mr-1"
                              />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <span className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-500 text-sm font-semibold">
                            <FontAwesomeIcon
                              icon={
                                order.status === "delivered"
                                  ? faCheckCircle
                                  : faBan
                              }
                              className="mr-2"
                            />
                            {order.status === "delivered"
                              ? "Completed"
                              : "Cancelled"}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon
                  icon={faShoppingBag}
                  className="text-5xl text-gray-300"
                />
              </div>
              <p className="text-gray-500 text-xl font-semibold mb-2">
                No orders found
              </p>
              <p className="text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageOrders;
