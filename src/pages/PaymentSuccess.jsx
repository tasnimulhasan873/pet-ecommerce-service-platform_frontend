import { useEffect, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faReceipt,
  faHome,
  faBox,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import { CartContext } from "../Contexts/CartContext/CartContext";
import { formatBdt } from "../utils/currency";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const paymentIntentId = searchParams.get("payment_intent");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  useEffect(() => {
    // Prevent duplicate verification attempts
    if (verificationAttempted) {
      return;
    }

    // Check if we have either a session ID (old checkout) or payment intent ID (new checkout)
    if (!sessionId && !paymentIntentId) {
      setError("Invalid payment session");
      setLoading(false);
      return;
    }

    setVerificationAttempted(true);

    const verifyPaymentAndCreateOrder = async () => {
      try {
        let response;

        // Use Payment Intent verification (new flow) if available, otherwise use Session verification (old flow)
        if (paymentIntentId) {
          response = await axios.post(
            "http://localhost:3000/payment/verify-payment",
            {
              paymentIntentId,
              userId: user?.uid || null,
            }
          );
        } else {
          response = await axios.post(
            "http://localhost:3000/payment/verify-session",
            {
              sessionId,
              userId: user?.uid || null,
            }
          );
        }

        if (response.data.success) {
          setOrder(response.data.order);
          // Clear the cart after successful order
          if (clearCart) {
            clearCart();
          }
        } else {
          setError("Payment verification failed");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setError(err.response?.data?.message || "Failed to verify payment");
      } finally {
        setLoading(false);
      }
    };

    verifyPaymentAndCreateOrder();

    // Only re-run if payment IDs change (removed user and clearCart to prevent loops)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, paymentIntentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#002A48] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-6xl mb-4">✕</div>
          <h2 className="text-2xl font-bold text-[#002A48] mb-4">
            Payment Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/cart")}
            className="bg-[#002A48] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition-all"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-[150px]">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="text-green-500 text-8xl mb-4 animate-bounce"
          />
          <h1 className="text-4xl font-bold text-[#002A48] mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 text-lg">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div>
                <h2 className="text-2xl font-bold text-[#002A48] flex items-center gap-2">
                  <FontAwesomeIcon icon={faReceipt} />
                  Order Details
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-mono text-sm font-bold text-[#002A48]">
                  {order._id}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">
                Items Ordered:
              </h3>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 border-b pb-3"
                  >
                    <img
                      src={item.productImage || "/placeholder.png"}
                      alt={item.productName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {item.productName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#002A48]">
                        {formatBdt(item.priceBDT * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">
                  {formatBdt(order.subtotal)}
                </span>
              </div>
              {order.shipping > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-semibold">
                    {formatBdt(order.shipping)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (5%):</span>
                <span className="font-semibold">{formatBdt(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span className="font-semibold">
                    -{formatBdt(order.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="font-bold text-lg">Total Paid:</span>
                <span className="font-bold text-xl text-[#002A48]">
                  {formatBdt(order.totalBDT)}
                </span>
              </div>
            </div>

            {/* Billing Address */}
            {order.billingDetails && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Billing Address:
                </h3>
                <div className="text-gray-600 space-y-1">
                  <p>{order.billingDetails.fullName}</p>
                  <p>{order.billingDetails.address}</p>
                  <p>
                    {order.billingDetails.city}, {order.billingDetails.zip}
                  </p>
                  <p>{order.billingDetails.country}</p>
                  <p className="pt-2">{order.billingDetails.email}</p>
                  <p>{order.billingDetails.phone}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 bg-[#002A48] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition-all font-medium"
          >
            <FontAwesomeIcon icon={faHome} />
            Back to Home
          </button>
          <button
            onClick={() => navigate("/products")}
            className="flex items-center justify-center gap-2 bg-white text-[#002A48] border-2 border-[#002A48] px-6 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium"
          >
            <FontAwesomeIcon icon={faBox} />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
