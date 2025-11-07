import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import ChartComponent from '../components/ChartComponent';
import SummaryCard from '../components/SummaryCard';

/**
 * Analytics Dashboard page for sellers and administrators
 * Displays charts and metrics for auction performance
 */
const AnalyticsDashboard = () => {
  const { user } = useContext(AuthContext);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      let endpoint = '';

      if (user.role === 'admin') {
        endpoint = '/analytics/admin';
      } else if (user.role === 'seller') {
        endpoint = `/analytics/seller/${user.id}`;
      } else {
        setError('Unauthorized access');
        return;
      }

      const response = await api.get(endpoint);
      setAnalyticsData(response.data);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-auction-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          {user.role === 'admin' ? 'Platform-wide analytics and insights' : 'Your auction performance metrics'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Total Auctions"
          value={analyticsData.totalAuctions || 0}
          icon="🏷️"
          color="blue"
        />
        <SummaryCard
          title="Total Bids"
          value={analyticsData.totalBids || 0}
          icon="💰"
          color="green"
        />
        <SummaryCard
          title="Total Sales"
          value={analyticsData.totalSales || 0}
          icon="📈"
          color="yellow"
        />
        <SummaryCard
          title="Total Revenue"
          value={`$${analyticsData.totalRevenue || 0}`}
          icon="💵"
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartComponent
          data={analyticsData.growthData || []}
          type="line"
          dataKey="auctions"
          title="Auction Growth Over Time"
          color="#8884d8"
        />
        <ChartComponent
          data={analyticsData.growthData || []}
          type="line"
          dataKey="bids"
          title="Bid Activity Over Time"
          color="#82ca9d"
        />
        <ChartComponent
          data={analyticsData.growthData || []}
          type="bar"
          dataKey="sales"
          title="Sales Performance"
          color="#ffc658"
        />
        <ChartComponent
          data={analyticsData.growthData || []}
          type="bar"
          dataKey="revenue"
          title="Revenue Trends"
          color="#ff7300"
        />
      </div>

      {/* Seller-specific metrics for sellers */}
      {user.role === 'seller' && analyticsData.sellerMetrics && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard
              title="Auctions Created"
              value={analyticsData.sellerMetrics.auctionsCreated || 0}
              icon="📝"
              color="blue"
            />
            <SummaryCard
              title="Bids Received"
              value={analyticsData.sellerMetrics.bidsReceived || 0}
              icon="🎯"
              color="green"
            />
            <SummaryCard
              title="Revenue Generated"
              value={`$${analyticsData.sellerMetrics.revenueGenerated || 0}`}
              icon="💎"
              color="yellow"
            />
          </div>
        </div>
      )}

      {/* Admin-specific metrics for admins */}
      {user.role === 'admin' && analyticsData.adminMetrics && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <SummaryCard
              title="Active Sellers"
              value={analyticsData.adminMetrics.activeSellers || 0}
              icon="👥"
              color="blue"
            />
            <SummaryCard
              title="Active Bidders"
              value={analyticsData.adminMetrics.activeBidders || 0}
              icon="🛒"
              color="green"
            />
            <SummaryCard
              title="Platform Growth"
              value={`${analyticsData.adminMetrics.platformGrowth || 0}%`}
              icon="📊"
              color="yellow"
            />
            <SummaryCard
              title="Avg Auction Price"
              value={`$${analyticsData.adminMetrics.avgAuctionPrice || 0}`}
              icon="💰"
              color="red"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
