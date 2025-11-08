require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

const seedAdmin = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@auctionhouse.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: "Admin User",
      email: "admin@auctionhouse.com",
      passwordHash: "$2b$10$YdMA8.rw6C283Bm30BhG5uIFnGWHMOD47GXC5V.Mr2s.UYG2CnBty", // password: admin123
      role: "admin"
    });

    await adminUser.save();
    console.log("Admin user created successfully");
    console.log("Email: admin@auctionhouse.com");
    console.log("Password: admin123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
