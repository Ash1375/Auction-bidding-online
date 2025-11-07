// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// public
router.post("/register", authController.register);
router.post("/login", authController.login);

// protected
router.get("/me", authMiddleware, authController.getMe);
router.put("/me", authMiddleware, authController.updateProfile);
router.put("/me/password", authMiddleware, authController.changePassword);

module.exports = router;
