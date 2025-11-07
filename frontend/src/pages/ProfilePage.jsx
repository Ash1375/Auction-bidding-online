// frontend/src/pages/ProfilePage.jsx
import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function ProfilePage() {
  const { user, setUser, logout } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || "");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If not logged in, redirect to login.
  if (!user) {
    navigate("/login");
    return null;
  }

  const save = async () => {
    try {
      setLoading(true);
      const res = await api.put("/auth/me", { name });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMsg("Profile updated successfully!");
    } catch (err) {
      setMsg("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold text-auction-dark mb-4">
          My Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your account and access your auction features
        </p>
      </div>

      {/* Profile Overview */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-auction-blue rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-serif font-semibold text-auction-dark">
              Welcome back, {user.name}!
            </h2>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.role === 'seller'
                  ? 'bg-auction-gold text-auction-dark'
                  : 'bg-auction-blue text-white'
              }`}>
                {user.role === 'seller' ? '🏪 Seller' : '💰 Bidder'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-serif font-semibold text-auction-dark mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.role === "seller" ? (
              <>
                <Link
                  to="/create-auction"
                  className="btn-secondary flex items-center justify-center space-x-2 py-3"
                >
                  <span>➕</span>
                  <span>Create Auction</span>
                </Link>
                <Link
                  to="/mylistings"
                  className="btn-primary flex items-center justify-center space-x-2 py-3"
                >
                  <span>📦</span>
                  <span>My Listings</span>
                </Link>
                <Link
                  to="/"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <span>🔍</span>
                  <span>Browse Auctions</span>
                </Link>
              </>
            ) : (
              <Link
                to="/"
                className="btn-primary flex items-center justify-center space-x-2 py-3 col-span-full md:col-span-1"
              >
                <span>🔍</span>
                <span>Browse Auctions</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="card">
        <h3 className="text-xl font-serif font-semibold text-auction-dark mb-4">
          Edit Profile
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="Enter your full name"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={save}
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          {msg && (
            <div className={`p-3 rounded-lg ${
              msg.includes('successfully')
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm">{msg}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
