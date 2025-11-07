// backend/models/Dispute.js
const mongoose = require("mongoose");

/**
 * Dispute model for handling disputes between buyers and sellers.
 * Tracks the auction, involved parties, reason, status, and resolution.
 */
const disputeSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auction",
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["open", "resolved", "closed"],
    default: "open",
  },
  resolution: {
    type: String,
    trim: true,
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Admin who resolved it
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("Dispute", disputeSchema);
