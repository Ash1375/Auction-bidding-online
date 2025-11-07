// backend/controllers/analyticsController.js
const Analytics = require("../models/Analytics");
const Auction = require("../models/Auction");
const Payment = require("../models/Payment");

/**
 * Get overview analytics for the platform (accessible by admin)
 * Returns total metrics and growth trends
 */
const getOverviewAnalytics = async (req, res) => {
  try {
    // Aggregate total metrics from all analytics records
    const totalMetrics = await Analytics.aggregate([
      {
        $group: {
          _id: null,
          totalAuctions: { $sum: "$totalAuctions" },
          totalBids: { $sum: "$totalBids" },
          totalSales: { $sum: "$totalSales" },
          totalRevenue: { $sum: "$totalRevenue" },
        },
      },
    ]);

    // Get recent growth data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const growthData = await Analytics.find({ date: { $gte: thirtyDaysAgo } })
      .sort({ date: 1 })
      .select("date auctionGrowth bidGrowth salesGrowth revenueGrowth");

    res.json({
      success: true,
      data: {
        totals: totalMetrics[0] || {
          totalAuctions: 0,
          totalBids: 0,
          totalSales: 0,
          totalRevenue: 0,
        },
        growth: growthData,
      },
    });
  } catch (error) {
    console.error("Error fetching overview analytics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get analytics for a specific seller
 * Returns seller's auction performance, bids received, sales, revenue
 */
const getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.params.id;

    // Verify seller access (only seller themselves or admin can view)
    if (req.user.role !== "admin" && req.user._id.toString() !== sellerId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Get seller's auctions
    const auctions = await Auction.find({ sellerId }).select(
      "title status bids currentPrice viewCount"
    );

    // Calculate metrics
    const totalAuctions = auctions.length;
    const activeAuctions = auctions.filter((a) => a.status === "active").length;
    const endedAuctions = auctions.filter((a) => a.status === "ended").length;
    const totalViews = auctions.reduce((sum, a) => sum + a.viewCount, 0);
    const totalBids = auctions.reduce((sum, a) => sum + a.bids.length, 0);

    // Get sales and revenue from payments
    const payments = await Payment.find({
      sellerId,
      status: "completed",
    }).select("amount");

    const totalSales = payments.length;
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Get recent performance data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentAuctions = await Auction.find({
      sellerId,
      createdAt: { $gte: thirtyDaysAgo },
    }).countDocuments();

    res.json({
      success: true,
      data: {
        totalAuctions,
        activeAuctions,
        endedAuctions,
        totalViews,
        totalBids,
        totalSales,
        totalRevenue,
        recentAuctions,
        auctions: auctions.slice(0, 10), // Recent auctions
      },
    });
  } catch (error) {
    console.error("Error fetching seller analytics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get admin-level analytics (full platform data)
 * Includes detailed breakdowns and trends
 */
const getAdminAnalytics = async (req, res) => {
  try {
    // Only admins can access
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    // Get comprehensive platform data
    const totalAuctions = await Auction.countDocuments();
    const activeAuctions = await Auction.countDocuments({ status: "active" });
    const totalUsers = await require("../models/User").countDocuments();

    // Aggregate bid and payment data
    const totalBids = await require("../models/Bid").countDocuments();
    const totalPayments = await Payment.countDocuments({ status: "completed" });
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Get daily metrics for the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyMetrics = await Analytics.find({ date: { $gte: sevenDaysAgo } })
      .sort({ date: 1 })
      .select("date totalAuctions totalBids totalSales totalRevenue");

    // Top performing sellers
    const topSellers = await Analytics.aggregate([
      { $unwind: "$sellerMetrics" },
      {
        $group: {
          _id: "$sellerMetrics.sellerId",
          totalSales: { $sum: "$sellerMetrics.salesMade" },
          totalRevenue: { $sum: "$sellerMetrics.revenueGenerated" },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: "$seller" },
      { $project: { name: "$seller.name", totalSales: 1, totalRevenue: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          totalAuctions,
          activeAuctions,
          totalUsers,
          totalBids,
          totalPayments,
          totalRevenue: totalRevenue[0]?.total || 0,
        },
        dailyMetrics,
        topSellers,
      },
    });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getOverviewAnalytics,
  getSellerAnalytics,
  getAdminAnalytics,
};
