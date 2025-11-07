// frontend/src/pages/MyListings.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MyListings() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "seller") {
      navigate("/");
      return;
    }
    fetchListings();
  }, [user, navigate]);

  // Fetch all listings created by the logged-in seller
  const fetchListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/auctions/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuctions(res.data.auctions || []);
    } catch (err) {
      console.error("Error loading listings:", err);
      setError("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  // Seller chooses a bidder to sell to
  const sellToBidder = async (auctionId, bidderId) => {
    if (!window.confirm("Are you sure you want to sell this item to this bidder?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/auctions/${auctionId}/sell`,
        { bidderId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Auction sold successfully! (Payment placeholder)");
      fetchListings(); // Refresh list
    } catch (err) {
      console.error("Error selling auction:", err);
      alert("Failed to sell auction");
    }
  };

  if (!user || user.role !== "seller") {
    return null; // Will redirect
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold text-auction-dark mb-4">
          My Auction Listings
        </h1>
        <p className="text-gray-600">
          Manage your active auctions and track bidding activity
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchListings}
            className="mt-2 btn-primary"
          >
            Try Again
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-auction-blue"></div>
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No listings yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start your first auction to reach potential buyers.
          </p>
          <button
            onClick={() => navigate("/create-auction")}
            className="btn-secondary"
          >
            Create Your First Auction
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {auctions.map((auction) => (
            <div
              key={auction._id}
              className={`card ${
                auction.status === "sold" ? "bg-green-50 border-green-200" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-serif font-semibold text-auction-dark truncate">
                  {auction.title}
                </h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  auction.status === "sold"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {auction.status === "sold" ? "Sold ✅" : "Active"}
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{auction.description}</p>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Base Price:</span>
                  <span className="font-semibold text-auction-blue">
                    ₹{auction.basePrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Current Bid:</span>
                  <span className="font-bold text-auction-accent">
                    ₹{auction.currentPrice?.toLocaleString() || auction.basePrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">End Time:</span>
                  <span className="text-sm text-gray-700">
                    {new Date(auction.endTime).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Winning bid info if sold */}
              {auction.status === "sold" && auction.highestBidder && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-green-800 text-sm">
                    <strong>Sold to:</strong> {auction.highestBidder?.name || "Unknown Bidder"}
                  </p>
                </div>
              )}

              {/* List all bids */}
              {auction.bids && auction.bids.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-semibold text-auction-dark">Bids Received:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {auction.bids.map((bid) => (
                      <div
                        key={bid._id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-auction-blue">
                            ₹{bid.amount.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-600">
                            by {bid.bidderName || bid.bidderId}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {new Date(bid.createdAt).toLocaleDateString()}
                          </span>
                          {auction.status !== "sold" && (
                            <button
                              onClick={() => sellToBidder(auction._id, bid.bidderId)}
                              className="btn-primary text-xs py-1 px-2"
                            >
                              Sell
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No bids yet</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
