// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Form states for modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [formData, setFormData] = useState({});

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return <div className="text-center py-10">Access denied. Admin only.</div>;
  }

  // Fetch data based on active tab
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "users") {
        const res = await api.get("/admin/users");
        setUsers(res.data);
      } else if (activeTab === "auctions") {
        const res = await api.get("/admin/auctions");
        setAuctions(res.data);
      } else if (activeTab === "disputes") {
        const res = await api.get("/admin/disputes");
        setDisputes(res.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setAlert({ type: "error", message: "Failed to fetch data" });
    } finally {
      setLoading(false);
    }
  };

  // Show alert and auto-hide
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // User Management Functions
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setShowUserModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/user/${selectedUser._id}`, formData);
      showAlert("success", "User updated successfully");
      setShowUserModal(false);
      fetchData();
    } catch (error) {
      console.error("Error updating user:", error);
      showAlert("error", "Failed to update user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/user/${userId}`);
      showAlert("success", "User deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting user:", error);
      showAlert("error", "Failed to delete user");
    }
  };

  // Auction Management Functions
  const handleEditAuctionStatus = (auction) => {
    setSelectedAuction(auction);
    setFormData({ status: auction.status });
    setShowAuctionModal(true);
  };

  const handleUpdateAuctionStatus = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/auction/${selectedAuction._id}/status`, formData);
      showAlert("success", "Auction status updated successfully");
      setShowAuctionModal(false);
      fetchData();
    } catch (error) {
      console.error("Error updating auction status:", error);
      showAlert("error", "Failed to update auction status");
    }
  };

  // Dispute Resolution Functions
  const handleResolveDispute = (dispute) => {
    setSelectedDispute(dispute);
    setFormData({ resolution: "" });
    setShowDisputeModal(true);
  };

  const handleSubmitResolution = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/dispute/${selectedDispute._id}/resolve`, formData);
      showAlert("success", "Dispute resolved successfully");
      setShowDisputeModal(false);
      fetchData();
    } catch (error) {
      console.error("Error resolving dispute:", error);
      showAlert("error", "Failed to resolve dispute");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Alert */}
      {alert && (
        <div className={`mb-4 p-4 rounded ${alert.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {alert.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex mb-6">
        <button
          className={`px-4 py-2 mr-2 ${activeTab === "users" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("users")}
        >
          User Management
        </button>
        <button
          className={`px-4 py-2 mr-2 ${activeTab === "auctions" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("auctions")}
        >
          Auction Monitoring
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "disputes" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setActiveTab("disputes")}
        >
          Dispute Resolution
        </button>
      </div>

      {/* Loading */}
      {loading && <div className="text-center py-4">Loading...</div>}

      {/* Users Tab */}
      {activeTab === "users" && !loading && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Role</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-4 py-2 border">{user.name}</td>
                    <td className="px-4 py-2 border">{user.email}</td>
                    <td className="px-4 py-2 border">{user.role}</td>
                    <td className="px-4 py-2 border">
                      <button
                        className="bg-blue-500 text-white px-2 py-1 mr-2 rounded"
                        onClick={() => handleEditUser(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Auctions Tab */}
      {activeTab === "auctions" && !loading && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Auctions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Title</th>
                  <th className="px-4 py-2 border">Seller</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Current Price</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {auctions.map((auction) => (
                  <tr key={auction._id}>
                    <td className="px-4 py-2 border">{auction.title}</td>
                    <td className="px-4 py-2 border">{auction.sellerId?.name || "N/A"}</td>
                    <td className="px-4 py-2 border">{auction.status}</td>
                    <td className="px-4 py-2 border">${auction.currentPrice}</td>
                    <td className="px-4 py-2 border">
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={() => handleEditAuctionStatus(auction)}
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disputes Tab */}
      {activeTab === "disputes" && !loading && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Disputes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Auction</th>
                  <th className="px-4 py-2 border">Buyer</th>
                  <th className="px-4 py-2 border">Seller</th>
                  <th className="px-4 py-2 border">Reason</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((dispute) => (
                  <tr key={dispute._id}>
                    <td className="px-4 py-2 border">{dispute.auctionId?.title || "N/A"}</td>
                    <td className="px-4 py-2 border">{dispute.buyerId?.name || "N/A"}</td>
                    <td className="px-4 py-2 border">{dispute.sellerId?.name || "N/A"}</td>
                    <td className="px-4 py-2 border">{dispute.reason}</td>
                    <td className="px-4 py-2 border">{dispute.status}</td>
                    <td className="px-4 py-2 border">
                      {dispute.status === "open" && (
                        <button
                          className="bg-green-500 text-white px-2 py-1 rounded"
                          onClick={() => handleResolveDispute(dispute)}
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Edit User</h3>
            <form onSubmit={handleUpdateUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="bidder">Bidder</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auction Status Modal */}
      {showAuctionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Update Auction Status</h3>
            <form onSubmit={handleUpdateAuctionStatus}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAuctionModal(false)}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Resolution Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Resolve Dispute</h3>
            <form onSubmit={handleSubmitResolution}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Resolution</label>
                <textarea
                  name="resolution"
                  value={formData.resolution || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded"
                  rows="4"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
                  Resolve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
