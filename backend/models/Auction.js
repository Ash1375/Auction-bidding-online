const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true },
  description: String,
  basePrice: { type: Number, required: true },
  currentPrice: { type: Number, default: 0 },
  images: [String],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ["upcoming", "active", "ended"],
    default: "upcoming",
  },

  // ✅ ADD THIS FIELD (to fix your error)
  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  // ✅ Keep bids history
  bids: [
    {
      bidderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      amount: Number,
      time: { type: Date, default: Date.now },
    },
  ],

  // Analytics: Track item views for reporting
  viewCount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Auction", auctionSchema);
