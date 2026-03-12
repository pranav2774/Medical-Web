const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const { uploadPrescription } = require('../utils/cartImageService');

// @desc    Create a new pickup order from cart
// @route   POST /api/orders
// @access  Private
exports.createPickupOrder = async (req, res, next) => {
  try {
    const { items, totalPrice, pickupDate, pickupTime, phone, notes, prescriptionImageBase64 } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items',
      });
    }

    if (!pickupDate || !pickupTime || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide pickup date, time, and phone number',
      });
    }

    let prescriptionImageUrl = undefined;

    // Handle Image upload if restricted item is inside the cart
    if (prescriptionImageBase64) {
      const uploadResult = await uploadPrescription(
          prescriptionImageBase64,
          `prescription_${req.user.id}.png` // Generic identifier, assuming PNG from canvas/browser
      );

      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          message: uploadResult.error || 'Failed to securely upload prescription image',
        });
      }

      prescriptionImageUrl = uploadResult.url;
    }

    // Prepare medicines array for order ensuring correct format
    const orderMedicines = items.map(item => ({
      medicineId: item._id,
      quantity: item.cartQuantity,
      price: item.price
    }));

    const order = new Order({
      patientId: req.user.id,
      medicines: orderMedicines,
      totalPrice,
      pickupDate,
      pickupTime,
      phone,
      notes,
      prescriptionImageUrl,
      status: 'pending',
      paymentStatus: 'pending'
    });

    const createdOrder = await order.save();

    res.status(201).json({
      success: true,
      data: createdOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's logged-in orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ patientId: req.user.id })
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;

    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with id of ${req.params.id}`,
      });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

