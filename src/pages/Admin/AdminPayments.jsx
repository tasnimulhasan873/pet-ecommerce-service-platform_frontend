import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faUserDoctor,
  faShoppingCart,
  faChartLine,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import IncomeSummaryCard from "../../components/Admin/IncomeSummaryCard";
import PaymentTable from "../../components/Admin/PaymentTable";
import PaymentChart from "../../components/Admin/PaymentChart";

const AdminPayments = () => {
  const [appointmentData, setAppointmentData] = useState({
    total: 0,
    monthlyData: {},
    transactions: [],
  });
  const [orderData, setOrderData] = useState({
    total: 0,
    monthlyData: {},
    transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllPayments();
  }, []);

  const fetchAllPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both appointments and orders data in parallel
      const [appointmentsRes, ordersRes] = await Promise.all([
        axios.get("http://localhost:3000/api/admin/payments/appointments"),
        axios.get("http://localhost:3000/api/admin/payments/orders"),
      ]);

      if (appointmentsRes.data.success) {
        setAppointmentData({
          total: appointmentsRes.data.total,
          monthlyData: appointmentsRes.data.monthlyData,
          transactions: appointmentsRes.data.transactions,
        });
      }

      if (ordersRes.data.success) {
        setOrderData({
          total: ordersRes.data.total,
          monthlyData: ordersRes.data.monthlyData,
          transactions: ordersRes.data.transactions,
        });
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      setError("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  // Combine all transactions and sort by date
  const allTransactions = [
    ...appointmentData.transactions,
    ...orderData.transactions,
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalRevenue = appointmentData.total + orderData.total;
  const lastTransaction = allTransactions[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-28 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">
            Loading payment analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faDollarSign}
            className="text-6xl text-red-300 mb-4"
          />
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={fetchAllPayments}
            className="px-6 py-2 bg-[#002A48] text-white rounded-lg hover:bg-[#003d6b] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center">
          <div className="bg-gradient-to-br from-[#002A48] to-[#004080] p-4 rounded-2xl shadow-lg mr-4">
            <FontAwesomeIcon
              icon={faDollarSign}
              className="text-3xl text-white"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[#002A48] mb-1">
              Payment Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive revenue tracking from all services
            </p>
          </div>
        </div>

        {/* Income Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <IncomeSummaryCard
            title="Doctor Appointments Income"
            amount={appointmentData.total}
            icon={faUserDoctor}
            gradient="from-blue-500 to-blue-600"
          />
          <IncomeSummaryCard
            title="Orders Income"
            amount={orderData.total}
            icon={faShoppingCart}
            gradient="from-green-500 to-green-600"
          />
          <IncomeSummaryCard
            title="Total Service Income"
            amount={totalRevenue}
            icon={faDollarSign}
            gradient="from-purple-500 to-purple-600"
          />
        </div>

        {/* Last Transaction Card */}
        {lastTransaction && (
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full mr-4">
                  <FontAwesomeIcon icon={faClock} className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1 opacity-90">
                    Last Transaction
                  </h3>
                  <p className="text-2xl font-bold">
                    ${lastTransaction.amount.toFixed(2)}
                  </p>
                  <p className="text-sm opacity-75 mt-1">
                    {lastTransaction.userName} •{" "}
                    {new Date(lastTransaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-semibold">
                  {lastTransaction.type}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-[#002A48] mb-6 flex items-center">
            <FontAwesomeIcon
              icon={faChartLine}
              className="mr-3 text-[#002A48]"
            />
            Revenue Trends
          </h2>
          <PaymentChart
            appointmentData={appointmentData.monthlyData}
            orderData={orderData.monthlyData}
          />
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-[#002A48] mb-6">
            All Transactions
          </h2>
          <PaymentTable
            transactions={allTransactions.slice(0, 20)}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
