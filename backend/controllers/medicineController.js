const Medicine = require('../models/Medicine');

// @desc    Get all medicines with search, filter, and pagination
// @route   GET /api/medicines
// @access  Private/Admin
const getAllMedicines = async (req, res) => {
    try {
        const {
            search,
            category,
            illnessCategory,
            stockStatus,
            requiresPrescription,
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
        if (category) {
            query.category = category;
        }

        // Filter by illness category
        if (illnessCategory) {
            query.illnessCategory = illnessCategory;
        }

        // Filter by stock status
        if (stockStatus !== undefined) {
            query.stockStatus = stockStatus === 'true';
        }

        // Filter by prescription requirement
        if (requiresPrescription !== undefined) {
            query.requiresPrescription = requiresPrescription === 'true';
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOrder = order === 'desc' ? -1 : 1;
        const sortOptions = { [sortBy]: sortOrder };

        // Execute query with pagination
        const medicines = await Medicine.find(query)
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip(skip);

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
        console.error('Get medicines error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching medicines',
            error: error.message,
        });
    }
};

// @desc    Get single medicine by ID
// @route   GET /api/medicines/:id
// @access  Private/Admin
const getMedicineById = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

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
        console.error('Get medicine by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching medicine',
            error: error.message,
        });
    }
};

// @desc    Create new medicine
// @route   POST /api/medicines
// @access  Private/Admin
const createMedicine = async (req, res) => {
    try {
        const {
            name,
            category,
            description,
            manufacturer,
            price,
            quantity,
            unit,
            expiryDate,
            batchNumber,
            requiresPrescription,
            image,
            illnessCategory,
        } = req.body;

        // Validate required fields
        if (!name || !category || !price || quantity === undefined || !expiryDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: name, category, price, quantity, expiryDate',
            });
        }

        // Check if medicine with same name already exists
        const existingMedicine = await Medicine.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
        if (existingMedicine) {
            return res.status(400).json({
                success: false,
                message: 'A medicine with this name already exists',
            });
        }

        // Create medicine
        const medicine = await Medicine.create({
            name,
            category,
            description,
            manufacturer,
            price,
            quantity,
            unit,
            expiryDate,
            batchNumber,
            requiresPrescription: requiresPrescription || false,
            image,
            illnessCategory,
        });

        res.status(201).json({
            success: true,
            message: 'Medicine created successfully',
            data: medicine,
        });
    } catch (error) {
        console.error('Create medicine error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating medicine',
            error: error.message,
        });
    }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private/Admin
const updateMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found',
            });
        }

        // Update fields
        const {
            name,
            category,
            description,
            manufacturer,
            price,
            quantity,
            unit,
            expiryDate,
            batchNumber,
            requiresPrescription,
            image,
            illnessCategory,
        } = req.body;

        if (name) medicine.name = name;
        if (category) medicine.category = category;
        if (description !== undefined) medicine.description = description;
        if (manufacturer !== undefined) medicine.manufacturer = manufacturer;
        if (price !== undefined) medicine.price = price;
        if (quantity !== undefined) medicine.quantity = quantity;
        if (unit) medicine.unit = unit;
        if (expiryDate) medicine.expiryDate = expiryDate;
        if (batchNumber !== undefined) medicine.batchNumber = batchNumber;
        if (requiresPrescription !== undefined) medicine.requiresPrescription = requiresPrescription;
        if (image !== undefined) medicine.image = image;
        if (illnessCategory !== undefined) medicine.illnessCategory = illnessCategory;

        await medicine.save();

        res.status(200).json({
            success: true,
            message: 'Medicine updated successfully',
            data: medicine,
        });
    } catch (error) {
        console.error('Update medicine error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating medicine',
            error: error.message,
        });
    }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private/Admin
const deleteMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found',
            });
        }

        await medicine.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Medicine deleted successfully',
        });
    } catch (error) {
        console.error('Delete medicine error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting medicine',
            error: error.message,
        });
    }
};

// @desc    Update medicine stock
// @route   PATCH /api/medicines/:id/stock
// @access  Private/Admin
const updateStock = async (req, res) => {
    try {
        const { quantity } = req.body;

        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid quantity (non-negative number)',
            });
        }

        const medicine = await Medicine.findById(req.params.id);

        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: 'Medicine not found',
            });
        }

        medicine.quantity = quantity;
        await medicine.save();

        res.status(200).json({
            success: true,
            message: 'Stock updated successfully',
            data: medicine,
        });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating stock',
            error: error.message,
        });
    }
};

// @desc    Get medicines with low stock
// @route   GET /api/medicines/low-stock
// @access  Private/Admin
const getLowStock = async (req, res) => {
    try {
        const { threshold = 10 } = req.query;

        const medicines = await Medicine.find({
            quantity: { $lte: parseInt(threshold), $gt: 0 },
        }).sort({ quantity: 1 });

        res.status(200).json({
            success: true,
            count: medicines.length,
            data: medicines,
        });
    } catch (error) {
        console.error('Get low stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching low stock medicines',
            error: error.message,
        });
    }
};

// @desc    Get medicines expiring soon
// @route   GET /api/medicines/expiring-soon
// @access  Private/Admin
const getExpiringSoon = async (req, res) => {
    try {
        const { days = 30 } = req.query;

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + parseInt(days));

        const medicines = await Medicine.find({
            expiryDate: {
                $gte: new Date(),
                $lte: futureDate,
            },
        }).sort({ expiryDate: 1 });

        res.status(200).json({
            success: true,
            count: medicines.length,
            data: medicines,
        });
    } catch (error) {
        console.error('Get expiring medicines error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching expiring medicines',
            error: error.message,
        });
    }
};

// @desc    Bulk delete medicines
// @route   POST /api/medicines/bulk-delete
// @access  Private/Admin
const bulkDelete = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of medicine IDs',
            });
        }

        const result = await Medicine.deleteMany({ _id: { $in: ids } });

        res.status(200).json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} medicine(s)`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting medicines',
            error: error.message,
        });
    }
};

module.exports = {
    getAllMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    updateStock,
    getLowStock,
    getExpiringSoon,
    bulkDelete,
};
