// frontend/src/components/BidList.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function BidList({ auctionId }) {
  const [bids, setBids] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auctionId) fetchBids();
  }, [auctionId]);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/bids/${auctionId}`);
      setBids(res.data.bids || []);
    } catch (err) {
      setError("Failed to load bids");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-auction-blue"></div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {bids.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">💰</div>
          <p>No bids have been placed yet.</p>
          <p className="text-sm">Be the first to bid on this auction!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bids
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((bid, index) => (
              <div
                key={bid._id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  index === 0
                    ? 'bg-auction-gold/10 border-auction-gold'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? 'bg-auction-gold text-auction-dark'
                      : 'bg-gray-300 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-auction-blue text-lg">
                        ₹{bid.amount.toLocaleString()}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-1 bg-auction-gold text-auction-dark text-xs font-medium rounded-full">
                          Highest Bid
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      by {bid.bidderId?.name || "Anonymous Bidder"}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {new Date(bid.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(bid.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
