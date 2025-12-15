import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const IncomeSummaryCard = ({
  title,
  amount,
  icon,
  gradient,
  percentage,
  trend,
}) => {
  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
          <FontAwesomeIcon icon={icon} className="text-3xl" />
        </div>
        {percentage && (
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
            <span>{trend === "up" ? "↑" : "↓"}</span>
            <span>{percentage}%</span>
          </div>
        )}
      </div>

      <h3 className="text-sm font-semibold mb-1 opacity-90">{title}</h3>
      <p className="text-3xl font-bold mb-2">${amount.toFixed(2)}</p>
      <p className="text-xs opacity-75">Total earnings</p>
    </div>
  );
};

export default IncomeSummaryCard;
