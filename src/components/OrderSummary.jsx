import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingBag,
  faTruck,
  faPercent,
  faReceipt,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { formatBdt } from "../utils/currency";

const OrderSummary = ({
  subtotal,
  discount,
  tax,
  shipping,
  total,
  appliedCoupon,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <FontAwesomeIcon
          icon={faShoppingBag}
          className="text-[#FFB84C] text-xl"
        />
        <h2 className="text-2xl font-bold text-[#002A48]">Order Summary</h2>
      </div>

      {/* Summary Items */}
      <div className="space-y-4 mb-6">
        {/* Subtotal */}
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-gray-600 font-medium">Subtotal</span>
          <span className="text-lg font-semibold text-[#002A48]">
            {formatBdt(subtotal)}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faTruck} className="text-gray-500" />
            <span className="text-gray-600 font-medium">Shipping</span>
          </div>
          <span className="text-lg font-semibold text-[#002A48]">
            {shipping > 0 ? formatBdt(shipping) : "Free"}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faReceipt} className="text-gray-500" />
            <span className="text-gray-600 font-medium">Tax (5%)</span>
          </div>
          <span className="text-lg font-semibold text-[#002A48]">
            {formatBdt(tax)}
          </span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faPercent} className="text-green-500" />
              <span className="text-green-600 font-medium">
                Discount {appliedCoupon && `(${appliedCoupon.code})`}
              </span>
            </div>
            <span className="text-lg font-semibold text-green-600">
              -{formatBdt(discount)}
            </span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center py-4 bg-gradient-to-r from-[#002A48] to-[#004080] rounded-lg px-4 mt-4">
          <span className="text-white font-bold text-lg">Total</span>
          <span className="text-2xl font-extrabold text-[#FFB84C]">
            {formatBdt(total)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={() => navigate("/checkout")}
        className="w-full bg-[#FFB84C] text-[#002A48] font-bold py-4 rounded-lg hover:bg-[#002A48] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
      >
        <span>Proceed to Checkout</span>
        <FontAwesomeIcon icon={faArrowRight} />
      </button>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700 font-semibold mb-2">
          ✅ Secure Checkout
        </p>
        <p className="text-xs text-blue-600">
          Your payment information is encrypted and secure. We accept all major
          credit cards and payment methods.
        </p>
      </div>

      {/* Shipping Info */}
      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <p className="text-xs text-green-700 font-semibold mb-2">
          🚚 Free Shipping on Orders Over ৳12,000
        </p>
        <p className="text-xs text-green-600">
          Estimated delivery: 3-5 business days
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
