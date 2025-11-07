// backend/sockets/bidSocket.js
const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const mongoose = require("mongoose");

function handleBidSockets(io) {
  io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);

    // Join auction room
    socket.on("joinAuction", (auctionId) => {
      socket.join(auctionId);
      console.log(`Joined auction room: ${auctionId}`);
    });

    // Handle new bid
    socket.on("placeBid", async ({ auctionId, bidderId, amount }) => {
      try {
        const auction = await Auction.findById(auctionId);
        if (!auction) return socket.emit("errorMsg", "Auction not found");
        if (auction.isSold) return socket.emit("errorMsg", "Auction already sold");
        if (amount <= auction.currentPrice)
          return socket.emit("errorMsg", "Bid must be higher than current price");

        // Save bid
        await Bid.create({
          auctionId: new mongoose.Types.ObjectId(auctionId),
          bidderId: new mongoose.Types.ObjectId(bidderId),
          amount,
        });

        // Update auction current price
        auction.currentPrice = amount;
        auction.highestBidder = bidderId;
        await auction.save();

        io.to(auctionId).emit("bidUpdated", {
          auctionId,
          currentPrice: auction.currentPrice,
          highestBidder: bidderId,
        });
      } catch (err) {
        console.error("placeBid error:", err);
        socket.emit("errorMsg", "Server error placing bid");
      }
    });

    // Seller sells to chosen bidder
    socket.on("sellAuction", async ({ auctionId, bidderId }) => {
      try {
        const auction = await Auction.findById(auctionId);
        if (!auction) return socket.emit("errorMsg", "Auction not found");

        auction.isSold = true;
        auction.soldTo = bidderId;
        await auction.save();

        io.to(auctionId).emit("auctionSold", {
          auctionId,
          soldTo: bidderId,
        });
      } catch (err) {
        console.error("sellAuction error:", err);
        socket.emit("errorMsg", "Error closing auction");
      }
    });

    socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
  });
}

module.exports = { handleBidSockets };
