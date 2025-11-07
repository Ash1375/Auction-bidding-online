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

/**
 * Middleware for input validation on payment confirmation
 * Ensures paymentIntentId is provided in request body
 */
const validatePaymentConfirm = (req, res, next) => {
  const { paymentIntentId } = req.body;
  if (!paymentIntentId) {
    return res.status(400).json({ message: "Payment Intent ID is required" });
  }
  next();
};

// ✅ Initiate payment - POST /api/payment/initiate
router.post("/initiate", authMiddleware, validatePaymentInitiate, paymentController.initiatePayment);

// ✅ Confirm payment - POST /api/payment/confirm (for manual confirmation)
router.post("/confirm", authMiddleware, validatePaymentConfirm, paymentController.confirmPayment);

// ✅ Get payment status - GET /api/payment/:paymentId
router.get("/:paymentId", authMiddleware, paymentController.getPaymentStatus);

// ✅ Payment success callback - GET /api/payment/success
router.get("/success", authMiddleware, paymentController.paymentSuccess);

// ✅ Payment failure callback - GET /api/payment/failure
router.get("/failure", authMiddleware, paymentController.paymentFailure);

module.exports = router;
