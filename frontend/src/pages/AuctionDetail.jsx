import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import BidList from "../components/BidList";

const AuctionDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [auctionRes, bidsRes] = await Promise.all([
        api.get(`/auctions/${id}`),
        api.get(`/bids/${id}`)
      ]);
      setAuction(auctionRes.data.auction);
      setBids(bidsRes.data.bids);
    } catch (err) {
      console.error("Failed to fetch auction details:", err);
    } finally {
      setLoading(false);
    }
  };

  const placeBid = async (e) => {
    e.preventDefault();
    if (!amount || amount <= (auction.currentPrice || auction.basePrice)) {
      alert("Bid must be higher than current price");
      return;
    }

    try {
      setBidding(true);
      await api.post("/bids", { auctionId: id, amount: Number(amount) });
      setAmount("");
      await fetchData(); // Refresh data
    } catch (err) {
      alert(err.response?.data?.message || "Bid failed");
    } finally {
      setBidding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-auction-blue"></div>
      </div>
    );
  }

  if (!auction) return <p className="text-center text-gray-600">Auction not found.</p>;

  const currentPrice = auction.currentPrice || auction.basePrice;
  const isEnded = new Date(auction.endTime) < new Date();
  const timeLeft = new Date(auction.endTime) - new Date();
  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Auction Header */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-serif font-bold text-auction-dark">
                {auction.title}
              </h1>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isEnded ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {isEnded ? 'Auction Ended' : 'Live Auction'}
              </div>
            </div>

            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              {auction.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-semibold text-auction-blue text-xl">
                    ₹{auction.basePrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-auction-gold/10 rounded-lg">
                  <span className="text-gray-600">Current Bid:</span>
                  <span className="font-bold text-auction-accent text-2xl">
                    ₹{currentPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">
                      {isEnded ? 'Ended on' : 'Ends in'}
                    </p>
                    <p className="font-medium">
                      {isEnded
                        ? new Date(auction.endTime).toLocaleString()
                        : `${daysLeft}d ${hoursLeft}h ${minutesLeft}m`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Seller</p>
                    <p className="font-medium">{auction.sellerId?.name || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bidding Section */}
      {user?.role === "bidder" && !isEnded && (
        <div className="card">
          <h3 className="text-xl font-serif font-semibold text-auction-dark mb-4">
            Place Your Bid
          </h3>
          <form onSubmit={placeBid} className="space-y-4">
            <div>
              <label className="form-label">Bid Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Minimum bid: ₹${(currentPrice + 1).toLocaleString()}`}
                min={currentPrice + 1}
                className="form-input"
                required
              />
            </div>
            <button
              type="submit"
              disabled={bidding}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bidding ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Placing Bid...
                </span>
              ) : (
                'Place Bid'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Payment Section for Winner */}
      {isEnded && user && auction.highestBidder && auction.highestBidder._id === user.id && (
        <div className="card">
          <h3 className="text-xl font-serif font-semibold text-auction-dark mb-4">
            Congratulations! You Won This Auction
          </h3>
          <p className="text-gray-600 mb-4">
            Final Price: ₹{currentPrice.toLocaleString()}
          </p>
          <button
            onClick={() => navigate(`/payment/${id}`)}
            className="btn-primary"
          >
            Proceed to Payment
          </button>
        </div>
      )}

      {/* Bids History */}
      <div className="card">
        <h3 className="text-xl font-serif font-semibold text-auction-dark mb-4">
          Bid History
        </h3>
        <BidList auctionId={id} />
      </div>
    </div>
  );
};

export default AuctionDetail;
