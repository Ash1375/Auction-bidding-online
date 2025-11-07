import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "../services/api";

// Load Stripe (replace with your publishable key)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_...");

const CheckoutForm = ({ clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (error) {
      setMessage(`Payment failed: ${error.message}`);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      setMessage("Payment successful!");
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>
      <div className="mb-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-auction-blue text-white py-2 px-4 rounded-md hover:bg-auction-accent disabled:opacity-50"
      >
        {isProcessing ? "Processing..." : "Pay Now"}
      </button>
      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </form>
  );
};

const PaymentPage = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const initiatePayment = async () => {
      try {
        // Updated API endpoint to singular /payment/initiate
        const response = await api.post("/payment/initiate", { auctionId });
        setClientSecret(response.data.clientSecret);
        setPaymentId(response.data.paymentId);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to initiate payment");
        setLoading(false);
      }
    };

    initiatePayment();
  }, [auctionId]);

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      // Updated API endpoint to singular /payment/confirm
      await api.post("/payment/confirm", { paymentIntentId });
      // Show success message and redirect
      alert("Payment successful! Thank you for your purchase.");
      navigate("/"); // Redirect to home or dashboard
    } catch (err) {
      alert("Payment confirmation failed. Please contact support.");
    }
  };

  if (loading) return <div className="text-center py-8">Loading payment details...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Payment for Auction</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
      </Elements>
    </div>
  );
};

export default PaymentPage;
