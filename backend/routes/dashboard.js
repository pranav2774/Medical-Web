const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// Dashboard routes are protected and admin-only
router.use(protect);
router.use(authorize('admin'));

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get aggregated KPI metrics, charts and recent orders
 * @access  Private/Admin
 */
router.get('/stats', getDashboardStats);

module.exports = router;
