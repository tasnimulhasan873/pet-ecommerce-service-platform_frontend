import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruck,
  faReceipt,
  faPercent,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import { formatBdt } from "../utils/currency";

const CheckoutOrderSummary = ({
  items = [],
  subtotal = 0,
  shipping = 0,
  tax = 0,
  discount = 0,
  total = 0,
  appliedCoupon = null,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
      <h2 className="text-2xl font-bold text-[#002A48] mb-6">Order Summary</h2>

      {/* Product List */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
          <FontAwesomeIcon icon={faShoppingCart} />
          Items ({items.length})
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => {
            const itemPrice = item.priceBDT || item.price || 0;
            const itemSubtotal = itemPrice * item.quantity;

            return (
              <div
                key={item._id}
                className="flex items-center gap-3 border-b border-gray-100 pb-3"
              >
                <img
                  src={item.productImage || "/placeholder.png"}
                  alt={item.productName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#002A48]">
                    {formatBdt(itemSubtotal)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Details */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        {/* Subtotal */}
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600 font-medium">Subtotal</span>
          <span className="text-lg font-semibold text-[#002A48]">
            {formatBdt(subtotal)}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faTruck} className="text-gray-500" />
            <span className="text-gray-600 font-medium">Shipping</span>
          </div>
          <span className="text-lg font-semibold text-[#002A48]">
            {shipping > 0 ? formatBdt(shipping) : "Free"}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between items-center py-2">
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
          <div className="flex justify-between items-center py-2">
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
          <span className="text-white font-bold text-lg">Grand Total</span>
          <span className="text-2xl font-extrabold text-[#FFB84C]">
            {formatBdt(total)}
          </span>
        </div>
      </div>

      {/* Security Note */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <p className="text-xs text-gray-600 text-center">
          🔒 Your payment information is secure and encrypted
        </p>
      </div>
    </div>
  );
};

export default CheckoutOrderSummary;
