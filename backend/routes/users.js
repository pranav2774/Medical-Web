const express = require('express');
const { getAllCustomers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all customers - Admin only
router.get('/customers', protect, authorize('admin'), getAllCustomers);

module.exports = router;
