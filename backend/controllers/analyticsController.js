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
      "title status bids currentPrice viewCount createdAt"
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

    // Get recent performance data (last 30 days) for growth chart
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentAuctions = await Auction.find({
      sellerId,
      createdAt: { $gte: thirtyDaysAgo },
    }).countDocuments();

    // Generate growth data for charts (mock data for now, can be enhanced with real historical data)
    const growthData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      growthData.push({
        date: date.toISOString().split('T')[0],
        auctions: Math.floor(Math.random() * 5), // Mock data
        bids: Math.floor(Math.random() * 20),
        sales: Math.floor(Math.random() * 3),
        revenue: Math.floor(Math.random() * 500),
      });
    }

    res.json({
      totalAuctions,
      totalBids,
      totalSales,
      totalRevenue,
      growthData,
      sellerMetrics: {
        auctionsCreated: totalAuctions,
        bidsReceived: totalBids,
        revenueGenerated: totalRevenue,
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

    // Get daily metrics for the last 30 days for growth chart
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyMetrics = await Analytics.find({ date: { $gte: thirtyDaysAgo } })
      .sort({ date: 1 })
      .select("date totalAuctions totalBids totalSales totalRevenue");

    // Generate growth data for charts (transform dailyMetrics to expected format)
    const growthData = dailyMetrics.map(metric => ({
      date: metric.date.toISOString().split('T')[0],
      auctions: metric.totalAuctions,
      bids: metric.totalBids,
      sales: metric.totalSales,
      revenue: metric.totalRevenue,
    }));

    // If no historical data, generate mock data
    if (growthData.length === 0) {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        growthData.push({
          date: date.toISOString().split('T')[0],
          auctions: Math.floor(Math.random() * 10),
          bids: Math.floor(Math.random() * 50),
          sales: Math.floor(Math.random() * 5),
          revenue: Math.floor(Math.random() * 1000),
        });
      }
    }

    // Calculate additional admin metrics
    const activeSellers = await Auction.distinct("sellerId").then(ids => ids.length);
    const activeBidders = await require("../models/Bid").distinct("bidderId").then(ids => ids.length);
    const avgAuctionPrice = totalAuctions > 0 ? totalRevenue[0]?.total / totalAuctions : 0;
    const platformGrowth = 15; // Mock growth percentage

    res.json({
      totalAuctions,
      totalBids,
      totalSales: totalPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
      growthData,
      adminMetrics: {
        activeSellers,
        activeBidders,
        platformGrowth,
        avgAuctionPrice,
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
