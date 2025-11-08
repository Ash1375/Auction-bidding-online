// Mock Payment Gateway Controller - DEMO ONLY, NOT FOR PRODUCTION USE
// This simulates payment processing without real external APIs for illustration purposes
const Payment = require("../models/Payment");
const Auction = require("../models/Auction");
const User = require("../models/User");

/**
 * Generate a random transaction ID for mock payments
 * @returns {string} Random transaction ID
 */
function generateTransactionId() {
  return "TXN" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

/**
 * Simulate payment processing delay for realism
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
function simulateDelay(ms = 2000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Randomly decide if payment will succeed or fail (70% success rate for demo)
 * @returns {boolean} True if payment succeeds, false otherwise
 */
function simulatePaymentOutcome() {
  return Math.random() < 0.7; // 70% success rate
}

/**
 * Initiate Payment - Simulates starting a payment transaction
 * POST /api/payment/initiate
 * Requires authentication and valid auctionId in request body
 * This is a MOCK implementation for demonstration only
 */
exports.initiatePayment = async (req, res) => {
  try {
    const { auctionId } = req.body;
    const payerId = req.user.id; // Extract payer ID from authenticated user

    console.log(`[MOCK PAYMENT] Initiating payment for auction ${auctionId} by user ${payerId}`);

    // Validate auction exists
    const auction = await Auction.findById(auctionId).populate("sellerId");
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // Verify auction has ended and user is the highest bidder
    if (auction.status !== "ended" || auction.highestBidder.toString() !== payerId) {
      return res.status(400).json({ message: "Not authorized to pay for this auction" });
    }

    // Prevent duplicate payment initiation
    const existingPayment = await Payment.findOne({ auctionId, payerId });
    if (existingPayment) {
      return res.status(400).json({ message: "Payment already initiated" });
    }

    // Generate mock transaction ID
    const transactionId = generateTransactionId();

    // Simulate processing delay
    await simulateDelay(1000);

    // Decide randomly if payment will succeed or fail
    const willSucceed = simulatePaymentOutcome();

    // Store mock payment details in database
    const payment = await Payment.create({
      transactionId,
      auctionId,
      payerId,
      sellerId: auction.sellerId._id,
      amount: auction.currentPrice,
      paymentStatus: "pending",
    });

    console.log(`[MOCK PAYMENT] Created transaction ${transactionId}, will ${willSucceed ? 'succeed' : 'fail'}`);

    // Return mock data for frontend simulation
    res.json({
      transactionId,
      paymentId: payment._id,
      willSucceed, // For demo purposes, reveal outcome (remove in production)
    });
  } catch (error) {
    console.error("[MOCK PAYMENT] Initiate payment error:", error);
    res.status(500).json({ message: "Failed to initiate payment" });
  }
};

/**
 * Payment Success Callback - Simulates successful payment completion
 * GET /api/payment/success
 * Updates payment status to succeeded
 * This is a MOCK implementation for demonstration only
 */
exports.paymentSuccess = async (req, res) => {
  try {
    const { transactionId } = req.query; // Assume transactionId passed as query param

    console.log(`[MOCK PAYMENT] Processing success for transaction ${transactionId}`);

    // Simulate processing delay
    await simulateDelay(1500);

    // Find and update payment record
    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.paymentStatus = "succeeded";
    await payment.save();

    console.log(`[MOCK PAYMENT] Transaction ${transactionId} marked as succeeded`);

    res.json({
      message: "Payment successful",
      transactionId: payment.transactionId,
    });
  } catch (error) {
    console.error("[MOCK PAYMENT] Payment success error:", error);
    res.status(500).json({ message: "Failed to process payment success" });
  }
};

/**
 * Payment Failure Callback - Simulates failed payment completion
 * GET /api/payment/failure
 * Updates payment status to failed
 * This is a MOCK implementation for demonstration only
 */
exports.paymentFailure = async (req, res) => {
  try {
    const { transactionId } = req.query; // Assume transactionId passed as query param

    console.log(`[MOCK PAYMENT] Processing failure for transaction ${transactionId}`);

    // Simulate processing delay
    await simulateDelay(1500);

    // Find and update payment record
    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.paymentStatus = "failed";
    await payment.save();

    console.log(`[MOCK PAYMENT] Transaction ${transactionId} marked as failed`);

    res.json({
      message: "Payment failed",
      transactionId: payment.transactionId,
    });
  } catch (error) {
    console.error("[MOCK PAYMENT] Payment failure error:", error);
    res.status(500).json({ message: "Failed to process payment failure" });
  }
};
