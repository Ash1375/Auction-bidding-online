// frontend/src/components/AuctionCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function AuctionCard({ auction }) {
  const currentPrice = auction.currentPrice || auction.basePrice || 0;
  const isEnded = new Date(auction.endTime) < new Date();
  const timeLeft = new Date(auction.endTime) - new Date();
  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return (
    <div className="card hover:scale-105 transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-serif font-semibold text-auction-dark truncate">
          {auction.title}
        </h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isEnded ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {isEnded ? 'Ended' : 'Active'}
        </div>
      </div>

      <p className="text-gray-600 mb-2 line-clamp-2">{auction.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Base Price:</span>
          <span className="font-semibold text-auction-blue">
            ₹{(auction.basePrice || 0).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Current Bid:</span>
          <span className="font-bold text-auction-accent text-lg">
            ₹{currentPrice.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isEnded ? (
              <span>Ended {new Date(auction.endTime).toLocaleDateString()}</span>
            ) : (
              <span>{daysLeft}d {hoursLeft}h left</span>
            )}
          </div>
        </div>

        <Link
          to={`/auctions/${auction._id}`}
          className="btn-primary w-full text-center inline-block"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
