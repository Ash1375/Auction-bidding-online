// backend/middleware/roleMiddleware.js
module.exports = function(requiredRole) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== requiredRole && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
};
