const express = require("express");
const router = express.Router();
const bidController = require("../controllers/bidController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Place bid (bidder)
router.post("/", authMiddleware, bidController.placeBid);

// ✅ Get bids for a specific auction
router.get("/:auctionId", bidController.getBidsForAuction);

module.exports = router;
