# 07 Admin Panel

## Overview
The Admin Panel module provides a comprehensive backend interface for administrators to manage the online auction platform. It includes user management, auction monitoring, and dispute resolution features, all secured with JWT authentication and role-based access control.

## Features
- **User Management**: View, edit, suspend, and delete users.
- **Auction Monitoring**: View all auctions (active/completed) and update their status.
- **Dispute Resolution**: Handle disputes between buyers and sellers by providing resolutions.
- **Secure Access**: All endpoints require admin role authentication.
- **Frontend Dashboard**: React-based admin dashboard with tables, modals, and form validation.

## Backend Components
- **Models**: Dispute.js (for tracking disputes).
- **Controllers**: adminController.js (handles all admin operations).
- **Routes**: adminRoutes.js (defines API endpoints).
- **Middleware**: Uses existing authMiddleware and roleMiddleware for security.

## Frontend Components
- **AdminDashboard.jsx**: Main dashboard page with tabs for user management, auction monitoring, and dispute resolution.
- **Integration**: Added to App.js routing and navigation for admin users.

## API Endpoints
- GET /api/admin/users
- PUT /api/admin/user/:id
- DELETE /api/admin/user/:id
- GET /api/admin/auctions
- PUT /api/admin/auction/:id/status
- GET /api/admin/disputes
- POST /api/admin/dispute/:id/resolve

## Security
- JWT authentication required for all routes.
- Role-based access: Only users with 'admin' role can access.
- Password hashes excluded from user data responses.
