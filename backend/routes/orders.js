const express = require('express');
const router = express.Router();
const { createPickupOrder, getAllOrders, updateOrderStatus, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.route('/')
  .post(protect, createPickupOrder)
  .get(protect, adminOnly, getAllOrders);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id/status')
  .put(protect, adminOnly, updateOrderStatus);

module.exports = router;
