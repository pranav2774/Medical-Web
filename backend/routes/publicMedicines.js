const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');

// @desc    Get all medicines for public catalog
// @route   GET /api/public/medicines
// @access  Public (No authentication required)
const getPublicMedicines = async (req, res) => {
    try {
        const {
            search,
            category,
            illnessCategory,
            stockStatus,
            page = 1,
            limit = 20,
            sortBy = 'name',
            order = 'asc',
        } = req.query;

        // Build query object
        const query = {};

        // Search by name, manufacturer, or illness category
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { manufacturer: { $regex: search, $options: 'i' } },
                { illnessCategory: { $regex: search, $options: 'i' } },
            ];
        }

        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }

        // Filter by illness category
        if (illnessCategory && illnessCategory !== 'all') {
            query.illnessCategory = illnessCategory;
        }

        // Filter by stock status
        if (stockStatus !== undefined && stockStatus !== 'all') {
            query.stockStatus = stockStatus === 'true';
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort options
        let sortOptions = {};
        if (sortBy === 'price') {
            sortOptions = { price: order === 'desc' ? -1 : 1 };
        } else if (sortBy === 'name') {
            sortOptions = { name: order === 'desc' ? -1 : 1 };
        } else if (sortBy === 'createdAt') {
            sortOptions = { createdAt: -1 }; // Newest first
        } else {
            sortOptions = { name: 1 }; // Default: alphabetical
        }

        // Execute query with pagination
        const medicines = await Medicine.find(query)
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(skip)
            .select('-__v'); // Exclude version key

        // Get total count for pagination
        const total = await Medicine.countDocuments(query);

        res.status(200).json({
            success: true,
            count: medicines.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: medicines,
        });
    } catch (error) {
        console.error('Get public medicines error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching medicines',
            error: error.message,
        });
    }
};

// @desc    Get single medicine by ID (public)
// @route   GET /api/public/medicines/:id
// @access  Public
const getPublicMedicineById = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id).select('-__v');

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found',
            });
        }

        res.status(200).json({
            success: true,
            data: medicine,
        });
    } catch (error) {
        console.error('Get public medicine by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching medicine',
            error: error.message,
        });
    }
};

// Public routes (no authentication required)
router.get('/', getPublicMedicines);
router.get('/:id', getPublicMedicineById);

module.exports = router;
