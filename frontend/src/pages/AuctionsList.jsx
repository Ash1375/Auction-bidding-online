// frontend/src/pages/AuctionsList.jsx
import React, { useEffect, useState } from "react";
import AuctionCard from "../components/AuctionCard";
import api from "../services/api";

export default function AuctionsList() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, ended

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auctions");
      setAuctions(res.data.auctions || []);
    } catch {
      setError("Failed to load auctions");
    } finally {
      setLoading(false);
    }
  };

  const filteredAuctions = auctions.filter(auction => {
    if (filter === "active") return new Date(auction.endTime) > new Date();
    if (filter === "ended") return new Date(auction.endTime) <= new Date();
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-auction-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold text-auction-dark mb-4">
          Live Auctions
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover unique items and place your bids on our premium auction platform.
          Find rare collectibles, art, and more.
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center space-x-4">
        {[
          { key: "all", label: "All Auctions" },
          { key: "active", label: "Active" },
          { key: "ended", label: "Ended" }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
              filter === key
                ? "bg-auction-blue text-white shadow-auction"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchAuctions}
            className="mt-2 btn-primary"
          >
            Try Again
          </button>
        </div>
      )}

      {filteredAuctions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏛️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === "all" ? "No auctions available" : `No ${filter} auctions`}
          </h3>
          <p className="text-gray-600">
            {filter === "all"
              ? "Check back later for new auctions."
              : `No auctions are currently ${filter}.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => (
            <AuctionCard key={auction._id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}
