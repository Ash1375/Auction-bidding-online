// backend/routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();
const {
  getOverviewAnalytics,
  getSellerAnalytics,
  getAdminAnalytics,
} = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

/**
 * Analytics routes for dashboard reporting
 * All routes require authentication
 */

// GET /api/analytics/overview - Platform overview (admin only)
router.get(
  "/overview",
  authMiddleware,
  roleMiddleware(["admin"]),
  getOverviewAnalytics
);

// GET /api/analytics/seller/:id - Seller-specific analytics
router.get("/seller/:id", authMiddleware, getSellerAnalytics);

// GET /api/analytics/admin - Full admin analytics
router.get("/admin", authMiddleware, roleMiddleware(["admin"]), getAdminAnalytics);

module.exports = router;
