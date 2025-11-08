// backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const routes = require("./routes/index");
const { handleBidSockets } = require("./sockets/bidSocket");
const bidRoutes = require("./routes/bidRoutes"); // ✅ NEW

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Attach io instance later via middleware
let io;

// Middleware to attach io to every request
app.use((req, res, next) => {
  req.io = io; // so controllers can emit socket events
  next();
});

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Connect MongoDB
connectDB();

// Mount main routes
app.use("/api", routes);

// ✅ Mount bid routes separately
app.use("/api/bids", bidRoutes);

// Create HTTP + Socket.io server
const server = http.createServer(app);
io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket handler (separate file)
handleBidSockets(io);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
  console.log("work done");
});
