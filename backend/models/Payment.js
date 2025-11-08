const mongoose = require("mongoose");

/**
 * Payment Schema for storing mock transaction details in MongoDB
 * This schema simulates payment processing for auction winners (DEMO ONLY - NOT FOR PRODUCTION)
 */
const paymentSchema = new mongoose.Schema(
  {
    // Unique transaction ID for mock tracking
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    // Reference to the auction being paid for
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
    },
    // ID of the payer (winning bidder)
    payerId: {
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
    // Payment status: pending, succeeded, failed
    paymentStatus: {
      type: String,
      enum: ["pending", "succeeded", "failed"],
      default: "pending",
    },
    // Mock payment method (e.g., card, bank transfer)
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
