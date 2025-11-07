const Bid = require("../models/Bid");
const Auction = require("../models/Auction");

// ✅ Place a bid
exports.placeBid = async (req, res) => {
  try {
    const { auctionId, amount } = req.body;
    const bidderId = req.user.id;

    if (!auctionId || !amount) {
      return res.status(400).json({ message: "auctionId and amount required" });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: "Auction not found" });
    if (auction.status !== "active")
      return res.status(400).json({ message: "Auction not active" });

    if (amount <= auction.currentPrice) {
      return res.status(400).json({ message: "Bid must be higher than current price" });
    }

    // Create and save bid
    const bid = await Bid.create({ auctionId, bidderId, amount });

    // Update auction
    auction.currentPrice = amount;
    auction.highestBidder = bidderId;
    await auction.save();

    // Emit real-time update (if socket integrated)
    req.io?.to(auctionId).emit("bidUpdated", {
      auctionId,
      amount,
      bidderId,
    });

    res.status(201).json({ message: "Bid placed successfully", bid });
  } catch (err) {
    console.error("placeBid error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get bids for a specific auction
exports.getBidsForAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const bids = await Bid.find({ auctionId })
      .populate("bidderId", "name email")
      .sort({ createdAt: -1 });
    res.json({ bids });
  } catch (err) {
    console.error("getBidsForAuction error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
