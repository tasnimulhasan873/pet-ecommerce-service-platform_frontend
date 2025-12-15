import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PaymentChart = ({ appointmentData, orderData }) => {
  // Merge both datasets by month
  const allMonths = new Set([
    ...Object.keys(appointmentData || {}),
    ...Object.keys(orderData || {}),
  ]);

  const chartData = Array.from(allMonths)
    .sort()
    .slice(-6) // Last 6 months
    .map((month) => {
      const [year, monthNum] = month.split("-");
      const monthName = new Date(
        year,
        parseInt(monthNum) - 1
      ).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      return {
        month: monthName,
        "Doctor Appointments": appointmentData[month] || 0,
        Orders: orderData[month] || 0,
      };
    });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border-2 border-gray-200">
          <p className="font-bold text-gray-800 mb-2">
            {payload[0].payload.month}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{" "}
              <span className="font-bold">${entry.value.toFixed(2)}</span>
            </p>
          ))}
          <p className="text-sm font-bold text-gray-800 mt-2 pt-2 border-t">
            Total: ${total.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-[#002A48] mb-4">
        Monthly Revenue Comparison
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="month"
            stroke="#002A48"
            style={{ fontSize: "12px", fontWeight: "600" }}
          />
          <YAxis
            stroke="#002A48"
            style={{ fontSize: "12px", fontWeight: "600" }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "14px", fontWeight: "600" }}
            iconType="square"
          />
          <Bar
            dataKey="Doctor Appointments"
            fill="#3B82F6"
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          />
          <Bar
            dataKey="Orders"
            fill="#10B981"
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentChart;
