import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTag,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

const CouponBox = ({ onApplyCoupon, appliedCoupon, onRemoveCoupon }) => {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setMessage({ type: "error", text: "Please enter a coupon code" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const result = await onApplyCoupon(couponCode.trim().toUpperCase());

    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: "Coupon applied successfully!" });
      setCouponCode("");
    } else {
      setMessage({
        type: "error",
        text: result.message || "Invalid coupon code",
      });
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleRemoveCoupon = () => {
    onRemoveCoupon();
    setCouponCode("");
    setMessage({ type: "success", text: "Coupon removed" });
    setTimeout(() => setMessage({ type: "", text: "" }), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FontAwesomeIcon icon={faTag} className="text-[#FFB84C] text-xl" />
        <h3 className="text-lg font-bold text-[#002A48]">Apply Coupon Code</h3>
      </div>

      {appliedCoupon ? (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-green-500 text-xl"
              />
              <div>
                <p className="font-bold text-green-700">{appliedCoupon.code}</p>
                <p className="text-sm text-green-600">
                  {appliedCoupon.description}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-red-500 hover:text-red-700 font-semibold text-sm underline"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex gap-3 mb-3">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FFB84C] focus:outline-none font-semibold text-[#002A48] uppercase"
              disabled={loading}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={loading}
              className="px-6 py-3 bg-[#002A48] text-white font-semibold rounded-lg hover:bg-[#FFB84C] hover:text-[#002A48] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
            >
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>

          {message.text && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-300"
                  : "bg-red-50 text-red-700 border border-red-300"
              }`}
            >
              <FontAwesomeIcon
                icon={
                  message.type === "success" ? faCheckCircle : faTimesCircle
                }
              />
              <p className="text-sm font-semibold">{message.text}</p>
            </div>
          )}

          {/* Available Coupons Hint */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 font-semibold mb-2">
              💡 Available Coupons:
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-white border border-blue-300 rounded text-xs font-bold text-blue-600">
                WELCOME10
              </span>
              <span className="px-2 py-1 bg-white border border-blue-300 rounded text-xs font-bold text-blue-600">
                SAVE20
              </span>
              <span className="px-2 py-1 bg-white border border-blue-300 rounded text-xs font-bold text-blue-600">
                FLAT50
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CouponBox;
