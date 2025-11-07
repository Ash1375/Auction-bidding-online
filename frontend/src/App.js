// frontend/src/App.js
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AuctionsList from "./pages/AuctionsList";
import AuctionDetail from "./pages/AuctionDetail";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import MyListings from "./pages/MyListings";
import CreateAuction from "./pages/CreateAuction";
import PaymentPage from "./pages/PaymentPage";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function Navigation() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-white shadow-auction border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-serif font-bold text-auction-blue hover:text-auction-accent transition-colors">
              AuctionHouse
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-auction-blue px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Auctions
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-auction-blue px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Dashboard
                </Link>
                {user.role === 'seller' && (
                  <>
                    <Link to="/create-auction" className="text-gray-700 hover:text-auction-blue px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Create Auction
                    </Link>
                    <Link to="/mylistings" className="text-gray-700 hover:text-auction-blue px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      My Listings
                    </Link>
                    <Link to="/analytics" className="text-gray-700 hover:text-auction-blue px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Analytics
                    </Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className="text-gray-700 hover:text-auction-blue px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Admin Panel
                    </Link>
                    <Link to="/analytics" className="text-gray-700 hover:text-auction-blue px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Analytics
                    </Link>
                  </>
                )}
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-auction-blue px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-auction-blue p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  console.log("Frontend scaffold loaded");
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-auction-light">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<AuctionsList />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<ProfilePage />} />
              <Route path="/auctions/:id" element={<AuctionDetail />} />
              <Route path="/mylistings" element={<MyListings />} />
              <Route path="/create-auction" element={<CreateAuction />} />
              <Route path="/payment/:auctionId" element={<PaymentPage />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
