const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * Middleware for input validation on payment initiation
 * Ensures auctionId is provided in request body
 */
const validatePaymentInitiate = (req, res, next) => {
  const { auctionId } = req.body;
  if (!auctionId) {
    return res.status(400).json({ message: "Auction ID is required" });
  }
  // Additional validation could be added here (e.g., check if auctionId is valid ObjectId)
  next();
};

// ✅ Initiate payment - POST /api/payment/initiate (MOCK DEMO ONLY)
router.post("/initiate", authMiddleware, validatePaymentInitiate, paymentController.initiatePayment);

// ✅ Payment success callback - GET /api/payment/success (MOCK DEMO ONLY)
router.get("/success", authMiddleware, paymentController.paymentSuccess);

// ✅ Payment failure callback - GET /api/payment/failure (MOCK DEMO ONLY)
router.get("/failure", authMiddleware, paymentController.paymentFailure);

module.exports = router;
