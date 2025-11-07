const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_jwt_secret");

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || "bidder",
    };

    next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};
