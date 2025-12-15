import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserDoctor,
  faShoppingCart,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

const PaymentTable = ({ transactions, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#002A48] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <p className="text-gray-500 text-lg">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#002A48] to-[#004080] text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((txn, index) => (
              <tr
                key={txn._id || index}
                className={`hover:bg-blue-50 transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-6 py-4 font-mono text-sm font-semibold text-[#002A48]">
                  #{txn.transactionId || "N/A"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-semibold text-sm">
                      {txn.userName ||
                        txn.userEmail?.split("@")[0] ||
                        "Unknown"}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {txn.userEmail}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={
                        txn.type === "Doctor Appointment"
                          ? faUserDoctor
                          : faShoppingCart
                      }
                      className={
                        txn.type === "Doctor Appointment"
                          ? "text-blue-500"
                          : "text-green-500"
                      }
                    />
                    <span
                      className={`text-sm font-semibold ${
                        txn.type === "Doctor Appointment"
                          ? "text-blue-700"
                          : "text-green-700"
                      }`}
                    >
                      {txn.type}
                    </span>
                  </div>
                  {txn.doctorName && (
                    <span className="text-xs text-gray-500 ml-6">
                      Dr. {txn.doctorName}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 font-bold text-lg text-green-600">
                  ${txn.amount?.toFixed(2) || "0.00"}
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  {new Date(txn.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-green-400 to-green-600 text-white shadow-md">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    {txn.status === "delivered" ? "DELIVERED" : "COMPLETED"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentTable;
