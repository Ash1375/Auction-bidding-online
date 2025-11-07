// backend/models/Analytics.js
const mongoose = require("mongoose");

/**
 * Analytics model to store platform metrics for reporting and dashboard.
 * Tracks item views, bid counts, sales history, and total platform growth.
 */
const analyticsSchema = new mongoose.Schema({
  // Date for grouping metrics (e.g., daily, monthly)
  date: { type: Date, required: true, default: Date.now },

  // Platform-wide metrics
  totalAuctions: { type: Number, default: 0 },
  totalBids: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 }, // in cents or dollars

  // Growth metrics (compared to previous period)
  auctionGrowth: { type: Number, default: 0 }, // percentage
  bidGrowth: { type: Number, default: 0 },
  salesGrowth: { type: Number, default: 0 },
  revenueGrowth: { type: Number, default: 0 },

  // Seller-specific metrics (aggregated per seller)
  sellerMetrics: [
    {
      sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      auctionsCreated: { type: Number, default: 0 },
      bidsReceived: { type: Number, default: 0 },
      salesMade: { type: Number, default: 0 },
      revenueGenerated: { type: Number, default: 0 },
    },
  ],

  // Item-specific metrics (for detailed reporting)
  itemMetrics: [
    {
      auctionId: { type: mongoose.Schema.Types.ObjectId, ref: "Auction" },
      views: { type: Number, default: 0 },
      bids: { type: Number, default: 0 },
      finalPrice: { type: Number, default: 0 },
      sold: { type: Boolean, default: false },
    },
  ],
});

module.exports = mongoose.model("Analytics", analyticsSchema);
