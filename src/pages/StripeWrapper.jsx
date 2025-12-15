import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';


// Replace with your own Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_PAYMENT_KEY);


const StripeWrapper = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
};


export default StripeWrapper;