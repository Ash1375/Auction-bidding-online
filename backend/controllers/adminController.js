// backend/controllers/adminController.js
const User = require("../models/User");
const Auction = require("../models/Auction");
const Dispute = require("../models/Dispute");

/**
 * Get all users for admin management.
 * Allows viewing, editing, suspending, deleting users.
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash"); // Exclude password hash for security
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update a user's details (e.g., role, suspend status).
 * Note: Suspension can be handled by setting a flag or role change.
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating passwordHash directly; use separate endpoint if needed
    delete updates.passwordHash;

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete a user (admin action).
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all auctions for monitoring.
 * Includes active and completed auctions.
 */
const getAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find()
      .populate("sellerId", "name email")
      .populate("highestBidder", "name email")
      .sort({ createdAt: -1 });
    res.json(auctions);
  } catch (error) {
    console.error("Error fetching auctions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update auction status (e.g., suspend or end early).
 */
const updateAuctionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["upcoming", "active", "ended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const auction = await Auction.findByIdAndUpdate(id, { status }, { new: true });
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    res.json({ message: "Auction status updated successfully", auction });
  } catch (error) {
    console.error("Error updating auction status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all disputes for resolution.
 */
const getDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate("auctionId", "title")
      .populate("buyerId", "name email")
      .populate("sellerId", "name email")
      .populate("resolvedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(disputes);
  } catch (error) {
    console.error("Error fetching disputes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Resolve a dispute by providing a resolution.
 */
const resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;

    if (!resolution || resolution.trim() === "") {
      return res.status(400).json({ message: "Resolution is required" });
    }

    const dispute = await Dispute.findByIdAndUpdate(
      id,
      {
        status: "resolved",
        resolution: resolution.trim(),
        resolvedBy: req.user.id,
        resolvedAt: new Date(),
      },
      { new: true }
    ).populate("auctionId", "title")
     .populate("buyerId", "name email")
     .populate("sellerId", "name email")
     .populate("resolvedBy", "name email");

    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" });
    }

    res.json({ message: "Dispute resolved successfully", dispute });
  } catch (error) {
    console.error("Error resolving dispute:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
  getAuctions,
  updateAuctionStatus,
  getDisputes,
  resolveDispute,
};
