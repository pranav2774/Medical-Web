const User = require('../models/User');

// @desc    Get all customers (users with role='user')
// @route   GET /api/users/customers
// @access  Private/Admin
exports.getAllCustomers = async (req, res) => {
    try {
        // Fetch all users with role='user', excluding password field
        const customers = await User.find({ role: 'user' })
            .select('-password')
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({
            success: true,
            count: customers.length,
            data: customers,
        });
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while fetching customers',
        });
    }
};
