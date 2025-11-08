// Mock Payment Page - DEMO ONLY, NOT FOR PRODUCTION USE
// This simulates payment processing without real external APIs for illustration purposes
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const MockCheckoutForm = ({ transactionId, willSucceed, onSuccess, onFailure }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsProcessing(true);
    setMessage("Processing payment...");

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (willSucceed) {
      setMessage("Payment successful!");
      // Call success callback
      try {
        await api.get(`/payment/success?transactionId=${transactionId}`);
        onSuccess(transactionId);
      } catch (err) {
        setMessage("Payment succeeded but confirmation failed.");
      }
    } else {
      setMessage("Payment failed. Please try again.");
      // Call failure callback
      try {
        await api.get(`/payment/failure?transactionId=${transactionId}`);
        onFailure(transactionId);
      } catch (err) {
        setMessage("Payment failed and confirmation error occurred.");
      }
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Mock Payment Demo</h2>
      <p className="text-sm text-gray-600 mb-4">
        This is a simulated payment for demonstration purposes only. No real money is processed.
      </p>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Mock Card Number</label>
        <input
          type="text"
          placeholder="4242 4242 4242 4242"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-auction-blue"
          disabled
        />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry</label>
          <input
            type="text"
            placeholder="12/34"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-auction-blue"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
          <input
            type="text"
            placeholder="123"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-auction-blue"
            disabled
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-auction-blue text-white py-2 px-4 rounded-md hover:bg-auction-accent disabled:opacity-50"
      >
        {isProcessing ? "Processing..." : "Simulate Payment"}
      </button>
      {message && (
        <p className={`mt-4 text-center text-sm ${message.includes("successful") ? "text-green-600" : message.includes("failed") ? "text-red-600" : "text-gray-600"}`}>
          {message}
        </p>
      )}
    </form>
  );
};

const PaymentPage = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const [transactionId, setTransactionId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [willSucceed, setWillSucceed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const initiatePayment = async () => {
      try {
        // Updated API endpoint to singular /payment/initiate
        const response = await api.post("/payment/initiate", { auctionId });
        setTransactionId(response.data.transactionId);
        setPaymentId(response.data.paymentId);
        setWillSucceed(response.data.willSucceed);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to initiate payment");
        setLoading(false);
      }
    };

    initiatePayment();
  }, [auctionId]);

  const handlePaymentSuccess = (transactionId) => {
    // Show success message and redirect
    alert(`Mock Payment successful! Transaction ID: ${transactionId}\n\nThis is a demo - no real payment was processed.`);
    navigate("/"); // Redirect to home or dashboard
  };

  const handlePaymentFailure = (transactionId) => {
    // Show failure message
    alert(`Mock Payment failed! Transaction ID: ${transactionId}\n\nThis is a demo - no real payment was attempted.`);
  };

  if (loading) return <div className="text-center py-8">Loading mock payment details...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Mock Payment for Auction</h1>
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          Transaction ID: <span className="font-mono">{transactionId}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          (This payment will {willSucceed ? "succeed" : "fail"} for demonstration)
        </p>
      </div>
      <MockCheckoutForm
        transactionId={transactionId}
        willSucceed={willSucceed}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
      />
    </div>
  );
};

export default PaymentPage;
