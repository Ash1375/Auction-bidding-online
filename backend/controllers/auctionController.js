// backend/controllers/auctionController.js
const Auction = require("../models/Auction");
const mongoose = require("mongoose");
const Bid = require("../models/Bid");

// Helper: validate start/end times
function validateTimes(startTime, endTime) {
  if (!startTime || !endTime) return false;
  const s = new Date(startTime);
  const e = new Date(endTime);
  return s < e;
}

/*
  NOTE: Image upload is not implemented here.
  TODO: integrate Cloudinary / multer later if needed.
*/

// ✅ Create Auction (seller only)
exports.createAuction = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { title, description, basePrice, startTime, endTime, images } = req.body;

    if (!title || !basePrice || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!validateTimes(startTime, endTime)) {
      return res.status(400).json({ message: "startTime must be before endTime" });
    }

    const auction = await Auction.create({
      sellerId,
      title,
      description: description || "",
      images: Array.isArray(images) ? images : images ? [images] : [],
      basePrice,
      currentPrice: basePrice,
      startTime,
      endTime,
      status:
        new Date(startTime) <= new Date() && new Date(endTime) > new Date()
          ? "active"
          : "upcoming",
    });

    res.status(201).json({ auction });
  } catch (err) {
    console.error("createAuction error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get a single auction by ID
exports.getAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Auction.findById(id)
      .populate("sellerId", "name email")
      .populate("highestBidder", "name email");

    if (!auction) return res.status(404).json({ message: "Auction not found" });
    res.json({ auction });
  } catch (err) {
    console.error("getAuction error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ List all active auctions
exports.listActiveAuctions = async (req, res) => {
  try {
    const now = new Date();
    const auctions = await Auction.find({
      status: "active",
      endTime: { $gt: now },
    })
      .sort({ createdAt: -1 })
      .populate("sellerId", "name email");

    res.json({ auctions });
  } catch (err) {
    console.error("listActiveAuctions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ List auctions created by the logged-in seller
// ✅ Get all auctions created by the logged-in seller
exports.listMyListings = async (req, res) => {
  try {
    const sellerId = req.user.id; // extracted from authMiddleware

    // If sellerId is a string, convert to ObjectId safely
    const mongoose = require("mongoose");
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    const auctions = await Auction.find({ sellerId: sellerObjectId })
      .populate("bids.bidderId", "name email") // populate bidder info
      .sort({ createdAt: -1 });

    if (!auctions || auctions.length === 0) {
      return res.json({ auctions: [] }); // no listings yet
    }

    res.json({ auctions });
  } catch (err) {
    console.error("listMyListings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Update auction (seller only)
exports.updateAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;
    const updates = req.body;

    const auction = await Auction.findOne({ _id: id, sellerId });
    if (!auction)
      return res.status(404).json({ message: "Auction not found or not owned by you" });

    if (updates.startTime || updates.endTime) {
      const s = updates.startTime || auction.startTime;
      const e = updates.endTime || auction.endTime;
      if (!validateTimes(s, e))
        return res.status(400).json({ message: "Invalid start/end times" });
    }

    Object.assign(auction, updates);
    await auction.save();
    res.json({ auction });
  } catch (err) {
    console.error("updateAuction error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete auction (seller only)
exports.deleteAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;
    const auction = await Auction.findOneAndDelete({ _id: id, sellerId });
    if (!auction)
      return res.status(404).json({ message: "Auction not found or not owned by you" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("deleteAuction error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Sell auction to a chosen bidder
// ✅ SELL AUCTION — Seller selects a winning bidder (no payment yet)
exports.sellAuction = async (req, res) => {
  try {
    const { id } = req.params; // auction id
    const { bidderId } = req.body; // winning bidder id
    const sellerId = req.user.id;

    // Find auction
    const auction = await Auction.findOne({ _id: id, sellerId });
    if (!auction) {
      return res.status(404).json({ message: "Auction not found or not owned by you" });
    }

    // Check auction validity
    if (auction.status !== "active" && auction.status !== "ended") {
      return res.status(400).json({ message: "Auction is not active or ended yet" });
    }

    // Find that bidder in bids
    const winningBid = auction.bids.find(
      (b) => b.bidderId.toString() === bidderId
    );
    if (!winningBid) {
      return res.status(404).json({ message: "Selected bidder not found in this auction" });
    }

    // ✅ Update auction
    auction.highestBidder = bidderId;
    auction.status = "sold"; // seller manually sold
    await auction.save();

    res.json({
      message: "Auction sold successfully",
      auction,
      placeholderPayment: "Your friend can integrate payment here later",
    });
  } catch (err) {
    console.error("sellAuction error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ List all auctions (public)
exports.getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find()
      .populate("sellerId", "name email")
      .populate("highestBidder", "name email")
      .sort({ createdAt: -1 });

    res.json({ auctions });
  } catch (err) {
    console.error("getAllAuctions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
