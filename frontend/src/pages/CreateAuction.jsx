// frontend/src/pages/CreateAuction.jsx
import React, { useState, useContext } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function CreateAuction() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    basePrice: "",
    startTime: "",
    endTime: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-auction-light">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-auction-dark mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">Please login to create an auction.</p>
          <button
            onClick={() => navigate("/login")}
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== "seller") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-auction-light">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold text-auction-dark mb-4">
            Seller Access Required
          </h1>
          <p className="text-gray-600 mb-6">Only sellers can create auctions.</p>
          <button
            onClick={() => navigate("/")}
            className="btn-primary"
          >
            Browse Auctions
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        basePrice: Number(form.basePrice),
        startTime: form.startTime,
        endTime: form.endTime
      };
      await api.post("/auctions", payload);
      navigate("/my-listings");
    } catch (err) {
      setError(err.response?.data?.message || "Create auction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold text-auction-dark mb-4">
          Create New Auction
        </h1>
        <p className="text-gray-600">
          List your item for auction and reach potential buyers worldwide
        </p>
      </div>

      <div className="card">
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label htmlFor="title" className="form-label">
              Auction Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter a compelling title for your auction"
            />
          </div>

          <div>
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="form-input resize-none"
              placeholder="Describe your item in detail..."
            />
          </div>

          <div>
            <label htmlFor="basePrice" className="form-label">
              Base Price (₹)
            </label>
            <input
              id="basePrice"
              name="basePrice"
              type="number"
              min="1"
              required
              value={form.basePrice}
              onChange={handleChange}
              className="form-input"
              placeholder="Set your starting bid price"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startTime" className="form-label">
                Start Time
              </label>
              <input
                id="startTime"
                name="startTime"
                type="datetime-local"
                required
                value={form.startTime}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="endTime" className="form-label">
                End Time
              </label>
              <input
                id="endTime"
                name="endTime"
                type="datetime-local"
                required
                value={form.endTime}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Auction...
              </span>
            ) : (
              'Create Auction'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
