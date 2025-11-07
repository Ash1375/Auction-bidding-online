const mongoose = require("mongoose");

/**
 * Payment Schema for storing transaction details in MongoDB
 * This schema handles secure payment processing for auction winners
 */
const paymentSchema = new mongoose.Schema(
  {
    // Reference to the auction being paid for
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    // ID of the buyer (winning bidder)
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // ID of the seller
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Payment amount in the base currency
    amount: {
      type: Number,
      required: true,
    },
    // Currency used for the payment (default: USD)
    currency: {
      type: String,
      default: "usd",
    },
    // Stripe PaymentIntent ID for tracking the transaction
    stripePaymentIntentId: {
      type: String,
      required: true,
    },
    // Payment status: pending, succeeded, failed, or canceled
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "canceled"],
      default: "pending",
    },
    // Payment method used (e.g., card, bank transfer)
    paymentMethod: {
      type: String,
      default: "card",
    },
  },
  // Automatically adds createdAt and updatedAt timestamps
  { timestamps: true }
);

// Export the Payment model
module.exports = mongoose.model("Payment", paymentSchema);
