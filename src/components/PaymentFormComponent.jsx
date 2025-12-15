import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard, faLock } from "@fortawesome/free-solid-svg-icons";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#002A48",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

const PaymentFormComponent = ({
  billingData,
  onSuccess,
  onError,
  isProcessing,
  setIsProcessing,
  clientSecret,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setCardError("Payment system is still loading. Please wait...");
      return;
    }

    if (!clientSecret) {
      setCardError("Payment session not initialized. Please try again.");
      onError("Payment session not initialized");
      return;
    }

    setIsProcessing(true);
    setCardError("");

    try {
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: billingData.fullName,
              email: billingData.email,
              phone: billingData.phone,
              address: {
                line1: billingData.address,
                city: billingData.city,
                postal_code: billingData.zip,
                country: "BD",
              },
            },
          },
        });

      if (stripeError) {
        console.error("Stripe error:", stripeError);
        const errorMsg =
          stripeError.message || "Payment failed. Please try again.";
        setCardError(errorMsg);
        onError(errorMsg);
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent);
      } else {
        const msg = `Payment status: ${paymentIntent?.status || "unknown"}`;
        setCardError(msg);
        onError(msg);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      const errorMsg =
        err.message || "Payment processing failed. Please try again.";
      setCardError(errorMsg);
      onError(errorMsg);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <FontAwesomeIcon
            icon={faCreditCard}
            className="text-[#002A48] text-xl"
          />
          <h3 className="text-xl font-bold text-[#002A48]">
            Payment Information
          </h3>
        </div>

        {/* Card Element */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="p-4 border-2 border-gray-300 rounded-lg focus-within:border-[#002A48] transition-colors">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
          {cardError && (
            <p className="text-red-500 text-sm mt-2">{cardError}</p>
          )}
        </div>

        {/* Security Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-700">
            <FontAwesomeIcon icon={faLock} />
            <p className="text-sm font-semibold">Secure Payment</p>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Your payment information is encrypted and secure. We never store
            your card details.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`w-full bg-[#002A48] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#004080] transition-all duration-300 flex items-center justify-center gap-2 ${
            !stripe || isProcessing ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faLock} />
              <span>Pay Securely</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default PaymentFormComponent;
