require("dotenv").config();
const mongoose = require("mongoose");
const Dispute = require("./models/Dispute");
const User = require("./models/User");
const Auction = require("./models/Auction");
const connectDB = require("./config/db");

const seedDisputes = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Get some users and auctions for disputes
    const users = await User.find().limit(3);
    const auctions = await Auction.find().limit(2);

    if (users.length < 2 || auctions.length < 1) {
      console.log("Not enough users or auctions to create disputes");
      process.exit(0);
    }

    // Create sample disputes
    const disputes = [
      {
        auctionId: auctions[0]._id,
        buyerId: users[0]._id,
        sellerId: users[1]._id,
        reason: "Item not as described",
        description: "The buyer claims the item received does not match the auction description.",
        status: "open"
      },
      {
        auctionId: auctions[0]._id,
        buyerId: users[1]._id,
        sellerId: users[0]._id,
        reason: "Payment not received",
        description: "The seller claims they haven't received payment for the won auction.",
        status: "resolved",
        resolution: "Buyer was contacted and payment was processed successfully.",
        resolvedBy: users[2]._id || users[0]._id,
        resolvedAt: new Date()
      }
    ];

    await Dispute.insertMany(disputes);
    console.log("Sample disputes created successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding disputes:", error);
    process.exit(1);
  }
};

seedDisputes();
