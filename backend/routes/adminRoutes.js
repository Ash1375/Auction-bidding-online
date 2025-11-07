// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

// User management routes
router.get("/users", adminController.getUsers);
router.put("/user/:id", adminController.updateUser);
router.delete("/user/:id", adminController.deleteUser);

// Auction monitoring routes
router.get("/auctions", adminController.getAuctions);
router.put("/auction/:id/status", adminController.updateAuctionStatus);

// Dispute resolution routes
router.get("/disputes", adminController.getDisputes);
router.post("/dispute/:id/resolve", adminController.resolveDispute);

module.exports = router;
