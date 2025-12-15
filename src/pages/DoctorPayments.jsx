import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faChartLine,
  faCalendarCheck,
  faMoneyBillWave,
  faFilter,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";

const DoctorPayments = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState("all"); // all, today, week, month
  const [earnings, setEarnings] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    pending: 0,
  });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3000/api/doctor/earnings?email=${user.email}`
        );

        if (response.data.success) {
          setEarnings(response.data.earnings);
          setTransactions(response.data.transactions);
        }
      } catch (error) {
        console.error("Error fetching earnings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [user]);

  const getFilteredTransactions = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);

      switch (filterPeriod) {
        case "today":
          return transactionDate >= today;
        case "week":
          return transactionDate >= weekAgo;
        case "month":
          return transactionDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#002A48] mb-2">
            Earnings & Payments
          </h1>
          <p className="text-gray-600">
            Track your consultation fees and payment history
          </p>
        </div>

        {/* Earnings Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <FontAwesomeIcon
                icon={faDollarSign}
                className="text-3xl opacity-80"
              />
              <span className="text-sm opacity-90">Total Earnings</span>
            </div>
            <div className="text-3xl font-bold">
              ${earnings.total.toFixed(2)}
            </div>
            <div className="text-sm opacity-90 mt-2">All time</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <FontAwesomeIcon
                icon={faCalendarCheck}
                className="text-3xl opacity-80"
              />
              <span className="text-sm opacity-90">This Month</span>
            </div>
            <div className="text-3xl font-bold">
              ${earnings.thisMonth.toFixed(2)}
            </div>
            <div className="text-sm opacity-90 mt-2">Last 30 days</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <FontAwesomeIcon
                icon={faChartLine}
                className="text-3xl opacity-80"
              />
              <span className="text-sm opacity-90">This Week</span>
            </div>
            <div className="text-3xl font-bold">
              ${earnings.thisWeek.toFixed(2)}
            </div>
            <div className="text-sm opacity-90 mt-2">Last 7 days</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <FontAwesomeIcon
                icon={faMoneyBillWave}
                className="text-3xl opacity-80"
              />
              <span className="text-sm opacity-90">Pending</span>
            </div>
            <div className="text-3xl font-bold">
              ${earnings.pending.toFixed(2)}
            </div>
            <div className="text-sm opacity-90 mt-2">Processing</div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Filter Controls */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Transaction History
            </h2>
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon
                icon={faDollarSign}
                className="text-6xl text-gray-300 mb-4"
              />
              <p className="text-gray-500 text-lg">No transactions found</p>
              <p className="text-gray-400 text-sm mt-2">
                Transactions will appear here when patients complete
                consultations
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {transaction.patientName}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {transaction.status.charAt(0).toUpperCase() +
                            transaction.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          <FontAwesomeIcon
                            icon={faCalendarCheck}
                            className="mr-1"
                          />
                          {formatDate(transaction.date)} at{" "}
                          {formatTime(transaction.date)}
                        </span>
                        <span>
                          <FontAwesomeIcon
                            icon={faCreditCard}
                            className="mr-1"
                          />
                          {transaction.paymentMethod}
                        </span>
                        <span className="text-gray-500">
                          ID: {transaction.appointmentId}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-green-600">
                        ${transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Payment Information
          </h3>
          <p className="text-blue-700 text-sm">
            Earnings are processed weekly and transferred to your registered
            bank account. Pending payments typically complete within 2-3
            business days after the consultation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorPayments;
