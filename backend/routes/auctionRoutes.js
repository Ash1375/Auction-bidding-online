// backend/routes/auctionRoutes.js
const express = require("express");
const router = express.Router();
const auctionController = require("../controllers/auctionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ✅ Destructure handlers from controller
const {
  createAuction,
  getAuction,
  listActiveAuctions,
  listMyListings,
  updateAuction,
  deleteAuction,
  sellAuction,
  getAllAuctions,
} = auctionController;

// ========================================================
// ✅ PUBLIC ROUTES (accessible to all users / bidders)
// ========================================================

// 🟢 Get all auctions (optional, for browsing)
router.get("/", getAllAuctions);

// 🟢 Get all active (ongoing) auctions
router.get("/active", listActiveAuctions);

// ========================================================
// ✅ PROTECTED SELLER ROUTES
// ========================================================

// 🟠 Seller: View their own listings
router.get(
  "/mine",
  authMiddleware,
  roleMiddleware("seller"),
  listMyListings
);

// 🟠 Seller: Create a new auction
router.post(
  "/",
  authMiddleware,
  roleMiddleware("seller"),
  createAuction
);

// 🟠 Seller: Update auction details
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("seller"),
  updateAuction
);

// 🟠 Seller: Delete auction
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("seller"),
  deleteAuction
);

// 🟠 Seller: Sell auction manually to a bidder
router.put(
  "/:id/sell",
  authMiddleware,
  roleMiddleware("seller"),
  auctionController.sellAuction
);

// ========================================================
// ✅ SINGLE AUCTION (keep this LAST)
// ========================================================
router.get("/:id", getAuction);

module.exports = router;
