
## Backend Changes
- [x] Update `getSellerAnalytics` in `backend/controllers/analyticsController.js` to return flattened data structure matching frontend expectations
- [x] Update `getAdminAnalytics` in `backend/controllers/analyticsController.js` to return flattened data structure and add missing metrics

## Frontend Changes
- [x] Change `user.id` to `user._id` in `frontend/src/pages/AnalyticsDashboard.jsx`
- [x] Add safety checks for user and analyticsData properties in `frontend/src/pages/AnalyticsDashboard.jsx`

## Testing
- [x] Test the dashboard to ensure no runtime errors occur
