// backend/seedAnalytics.js
// Script to seed sample analytics data for demonstration
require("dotenv").config();
const mongoose = require("mongoose");
const Analytics = require("./models/Analytics");
const Auction = require("./models/Auction");
const connectDB = require("./config/db");

const seedAnalytics = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Clear existing analytics data
    await Analytics.deleteMany({});
    console.log("Cleared existing analytics data");

    // Generate sample data for the last 30 days
    const sampleData = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

      // Simulate realistic growth patterns
      const baseAuctions = 5 + Math.floor(Math.random() * 10);
      const baseBids = baseAuctions * 3 + Math.floor(Math.random() * 20);
      const baseSales = Math.floor(baseBids * 0.3);
      const baseRevenue = baseSales * (50 + Math.floor(Math.random() * 200)); // $50-$250 per sale

      // Add some growth trends
      const growthMultiplier = 1 + (i / 30) * 0.1; // Slight upward trend

      const analyticsEntry = new Analytics({
        date,
        totalAuctions: Math.floor(baseAuctions * growthMultiplier),
        totalBids: Math.floor(baseBids * growthMultiplier),
        totalSales: Math.floor(baseSales * growthMultiplier),
        totalRevenue: Math.floor(baseRevenue * growthMultiplier),
        auctionGrowth: (Math.random() - 0.5) * 20, // -10% to +10%
        bidGrowth: (Math.random() - 0.5) * 30,
        salesGrowth: (Math.random() - 0.5) * 25,
        revenueGrowth: (Math.random() - 0.5) * 35,
        sellerMetrics: [
          {
            sellerId: new mongoose.Types.ObjectId(), // Mock seller ID
            auctionsCreated: Math.floor(Math.random() * 5),
            bidsReceived: Math.floor(Math.random() * 15),
            salesMade: Math.floor(Math.random() * 3),
            revenueGenerated: Math.floor(Math.random() * 500),
          },
          {
            sellerId: new mongoose.Types.ObjectId(),
            auctionsCreated: Math.floor(Math.random() * 3),
            bidsReceived: Math.floor(Math.random() * 10),
            salesMade: Math.floor(Math.random() * 2),
            revenueGenerated: Math.floor(Math.random() * 300),
          },
        ],
        itemMetrics: [
          {
            auctionId: new mongoose.Types.ObjectId(),
            views: Math.floor(Math.random() * 100),
            bids: Math.floor(Math.random() * 10),
            finalPrice: Math.floor(Math.random() * 200),
            sold: Math.random() > 0.5,
          },
          {
            auctionId: new mongoose.Types.ObjectId(),
            views: Math.floor(Math.random() * 80),
            bids: Math.floor(Math.random() * 8),
            finalPrice: Math.floor(Math.random() * 150),
            sold: Math.random() > 0.6,
          },
        ],
      });

      sampleData.push(analyticsEntry);
    }

    await Analytics.insertMany(sampleData);
    console.log("Seeded analytics data successfully");

    // Update some auctions with view counts
    const auctions = await Auction.find().limit(10);
    for (const auction of auctions) {
      auction.viewCount = Math.floor(Math.random() * 50) + 10;
      await auction.save();
    }
    console.log("Updated auction view counts");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding analytics data:", error);
    process.exit(1);
  }
};

seedAnalytics();
