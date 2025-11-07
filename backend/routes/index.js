const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");
const auctionRoutes = require("./auctionRoutes");
const bidRoutes = require("./bidRoutes");
const paymentRoutes = require("./paymentRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const adminRoutes = require("./adminRoutes");

router.use("/auth", authRoutes);
router.use("/auctions", auctionRoutes);
router.use("/bids", bidRoutes);
router.use("/payment", paymentRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
