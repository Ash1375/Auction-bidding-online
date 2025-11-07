const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); // Load Stripe with secret key from environment variables
const Payment = require("../models/Payment");
const Auction = require("../models/Auction");
const User = require("../models/User");

/**
 * Initiate Payment - Creates a Stripe PaymentIntent for secure payment processing
 * POST /api/payment/initiate
 * Requires authentication and valid auctionId in request body
 */
exports.initiatePayment = async (req, res) => {
  try {
    const { auctionId } = req.body;
    const buyerId = req.user.id; // Extract buyer ID from authenticated user

    // Validate auction exists
    const auction = await Auction.findById(auctionId).populate("sellerId");
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // Verify auction has ended and user is the highest bidder
    if (auction.status !== "ended" || auction.highestBidder.toString() !== buyerId) {
      return res.status(400).json({ message: "Not authorized to pay for this auction" });
    }

    // Prevent duplicate payment initiation
    const existingPayment = await Payment.findOne({ auctionId, buyerId });
    if (existingPayment) {
      return res.status(400).json({ message: "Payment already initiated" });
    }

    // Create Stripe PaymentIntent with auction details
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(auction.currentPrice * 100), // Convert to cents for Stripe
      currency: "usd",
      metadata: {
        auctionId: auctionId,
        buyerId: buyerId,
        sellerId: auction.sellerId._id.toString(),
      },
    });

    // Store payment details in database
    const payment = await Payment.create({
      auctionId,
      buyerId,
      sellerId: auction.sellerId._id,
      amount: auction.currentPrice,
      stripePaymentIntentId: paymentIntent.id,
      status: "pending",
    });

    // Return client secret for frontend Stripe integration
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Initiate payment error:", error);
    res.status(500).json({ message: "Failed to initiate payment" });
  }
};

/**
 * Confirm Payment - Verifies and updates payment status after Stripe processing
 * POST /api/payment/confirm
 * Requires authentication and paymentIntentId in request body
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve PaymentIntent status from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Find corresponding payment record in database
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Update payment status based on Stripe confirmation
    if (paymentIntent.status === "succeeded") {
      payment.status = "succeeded";
      await payment.save();

      // TODO: Optionally, update auction status or notify seller via socket events

      res.json({ message: "Payment successful", payment });
    } else {
      payment.status = "failed";
      await payment.save();
      res.status(400).json({ message: "Payment failed" });
    }
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ message: "Failed to confirm payment" });
  }
};

/**
 * Get Payment Status - Retrieves payment details and status
 * GET /api/payment/:paymentId
 * Requires authentication; only buyer or seller can access
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId).populate("auctionId buyerId sellerId");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Authorization: Only buyer or seller can view payment details
    if (
      payment.buyerId._id.toString() !== req.user.id &&
      payment.sellerId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({ payment });
  } catch (error) {
    console.error("Get payment status error:", error);
    res.status(500).json({ message: "Failed to get payment status" });
  }
};

/**
 * Payment Success Callback - Handles successful payment redirects
 * GET /api/payment/success
 * Can be used for redirect handling after successful payments
 */
exports.paymentSuccess = async (req, res) => {
  try {
    // In a production implementation, this might:
    // - Handle redirect from payment processor
    // - Process webhooks for payment confirmation
    // - Update payment status
    // - Send notifications to buyer/seller
    // For now, return success message
    res.json({
      message: "Payment successful",
      status: "success"
    });
  } catch (error) {
    console.error("Payment success callback error:", error);
    res.status(500).json({ message: "Failed to process payment success" });
  }
};

/**
 * Payment Failure Callback - Handles failed payment redirects
 * GET /api/payment/failure
 * Can be used for redirect handling after failed payments
 */
exports.paymentFailure = async (req, res) => {
  try {
    // In a production implementation, this might:
    // - Handle redirect from payment processor
    // - Log failure reasons
    // - Notify user of failure
    // - Provide retry options
    // For now, return failure message
    res.json({
      message: "Payment failed",
      status: "failure"
    });
  } catch (error) {
    console.error("Payment failure callback error:", error);
    res.status(500).json({ message: "Failed to process payment failure" });
  }
};
