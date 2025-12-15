import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../Contexts/CartContext/CartContext";
import { AuthContext } from "../Contexts/AuthContext/AuthContext";
import BillingForm from "../components/BillingForm";
import CheckoutOrderSummary from "../components/CheckoutOrderSummary";
import PaymentFormComponent from "../components/PaymentFormComponent";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_PAYMENT_KEY);

const CheckoutPage = () => {
  const {
    cartItems,
    getSubtotal,
    getShipping,
    getTax,
    getDiscount,
    getTotal,
    appliedCoupon,
  } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [billingData, setBillingData] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [step, setStep] = useState(1); // 1 = billing, 2 = payment

  // Check if cart is empty
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#002A48] mb-4">
            Your cart is empty
          </h2>
          <button
            onClick={() => navigate("/products")}
            className="bg-[#002A48] text-white px-6 py-3 rounded-lg hover:bg-[#004080] transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const tax = getTax();
  const discount = getDiscount();
  const total = getTotal();

  const handleCheckout = async (formData) => {
    if (!user) {
      setError("Please login to continue");
      navigate("/login");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Create Payment Intent
      const response = await axios.post(
        "http://localhost:3000/payment/create-payment-intent",
        {
          items: cartItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            priceUSD: item.priceUSD || 0,
            priceBDT: item.priceBDT || item.price || 0,
            quantity: item.quantity,
          })),
          totalBDT: total,
          couponCode: appliedCoupon?.code || null,
          billingDetails: {
            ...formData,
            userId: user.uid,
            userEmail: user.email,
          },
        }
      );

      const { clientSecret: secret } = response.data;
      setBillingData(formData);
      setClientSecret(secret);
      setStep(2); // Move to payment step
      setIsProcessing(false);
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    // Payment successful - just redirect to success page
    // Don't create order here to prevent duplicates
    // PaymentSuccess component will handle order creation
    navigate(`/payment-success?payment_intent=${paymentIntent.id}`);
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#002A48] mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase securely</p>

          {/* Step Indicator */}
          <div className="flex items-center gap-4 mt-6">
            <div
              className={`flex items-center gap-2 ${
                step === 1 ? "text-[#002A48] font-bold" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 1
                    ? "bg-[#002A48] text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                1
              </div>
              <span>Billing Info</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300">
              <div
                className={`h-full transition-all duration-300 ${
                  step === 2 ? "bg-[#002A48] w-full" : "bg-gray-300 w-0"
                }`}
              ></div>
            </div>
            <div
              className={`flex items-center gap-2 ${
                step === 2 ? "text-[#002A48] font-bold" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 2
                    ? "bg-[#002A48] text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </div>
              <span>Payment</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - Billing Form or Payment Form */}
          <div className="lg:col-span-2">
            {step === 1 ? (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <BillingForm
                  onSubmit={handleCheckout}
                  isProcessing={isProcessing}
                />
              </div>
            ) : (
              <>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentFormComponent
                    billingData={billingData}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                    clientSecret={clientSecret}
                  />
                </Elements>
                {/* Back to Billing Button */}
                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      setStep(1);
                      setClientSecret(null);
                      setError("");
                    }}
                    className="text-[#002A48] hover:underline font-medium"
                    disabled={isProcessing}
                  >
                    ← Back to Billing Information
                  </button>
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN - Order Summary */}
          <div className="lg:col-span-1">
            <CheckoutOrderSummary
              items={cartItems}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              discount={discount}
              total={total}
              appliedCoupon={appliedCoupon}
            />
          </div>
        </div>

        {/* Back to Cart Link */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/cart")}
            className="text-[#002A48] hover:underline font-medium"
            disabled={isProcessing}
          >
            ← Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
