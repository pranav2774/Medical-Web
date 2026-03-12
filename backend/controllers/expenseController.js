const Expense = require('../models/Expense');
const ExpenseBudget = require('../models/ExpenseBudget');
const Medicine = require('../models/Medicine');
const { uploadReceipt, deleteReceipt } = require('../utils/imagekitService');

// @desc    Get all expenses with filters and pagination
// @route   GET /api/expenses
// @access  Private/Admin
exports.getAllExpenses = async (req, res) => {
  try {
    const {
      search,
      category,
      dateFrom,
      dateTo,
      vendor,
      page = 1,
      limit = 20,
      sortBy = 'date',
      order = 'desc',
    } = req.query;

    // Build query object
    const query = {};

    // Search by vendor or description
    if (search) {
      query.$or = [
        { vendor: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by vendor
    if (vendor) {
      query.vendor = { $regex: vendor, $options: 'i' };
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        query.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.date.$lte = new Date(dateTo);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sortBy]: sortOrder };

    // Execute query with pagination
    const expenses = await Expense.find(query)
      .populate('medicineId', 'name category')
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Expense.countDocuments(query);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: expenses,
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error: error.message,
    });
  }
};

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
// @access  Private/Admin
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('medicineId', 'name category price')
      .populate('createdBy', 'name email');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error('Get expense by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense',
      error: error.message,
    });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private/Admin
exports.createExpense = async (req, res) => {
  try {
    const {
      medicineId,
      quantity,
      unitCost,
      date,
      vendor,
      category,
      description,
      isRecurring,
      recurringType,
      recurringEndDate,
    } = req.body;

    // Calculate total cost before creation to avoid validation errors
    const calculatedTotalCost = quantity * unitCost;

    // Create expense object
    const expenseData = {
      quantity,
      unitCost,
      totalCost: calculatedTotalCost,
      date,
      vendor,
      category,
      description,
      isRecurring,
      recurringType,
      recurringEndDate,
      createdBy: req.user.id,
    };

    // Handle receipt file upload if provided
    if (req.file) {
      const uploadResult = await uploadReceipt(req.file.buffer, req.file.originalname);

      if (!uploadResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Failed to upload receipt: ' + uploadResult.error,
        });
      }

      expenseData.receiptUrl = uploadResult.url;
      expenseData.receiptFileId = uploadResult.fileId;
    }

    // Add medicineId if provided
    if (medicineId) {
      const medicine = await Medicine.findById(medicineId);
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: 'Medicine not found',
        });
      }
      expenseData.medicineId = medicineId;
    }

    // Create the expense
    const expense = await Expense.create(expenseData);

    // Update medicine stock if medicine is referenced and category is Medicine
    if (medicineId && category === 'Medicine') {
      await Medicine.findByIdAndUpdate(
        medicineId,
        { $inc: { quantity: quantity } }
      );
    }

    // Update budget current spending
    const monthYear = new Date(date).toISOString().slice(0, 7); // YYYY-MM format
    const expense_total = calculatedTotalCost;

    await ExpenseBudget.findOneAndUpdate(
      { category, monthYear },
      { $inc: { currentSpending: expense_total } },
      { new: true }
    );

    // Populate and return
    const populatedExpense = await Expense.findById(expense._id)
      .populate('medicineId', 'name category')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: populatedExpense,
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating expense',
      error: error.message,
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private/Admin
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    const {
      quantity,
      unitCost,
      date,
      vendor,
      category,
      description,
      isRecurring,
      recurringType,
      recurringEndDate,
    } = req.body;

    // Calculate old total for budget update
    const oldMonthYear = expense.date.toISOString().slice(0, 7);
    const oldTotal = expense.totalCost || (expense.quantity * expense.unitCost);
    const oldQuantity = expense.quantity;
    const oldMedicineId = expense.medicineId;
    const oldCategory = expense.category;

    // Handle receipt file replacement if new file is provided
    if (req.file) {
      // Delete old receipt if it exists
      if (expense.receiptFileId) {
        const deleteResult = await deleteReceipt(expense.receiptFileId);
        if (!deleteResult.success) {
          console.warn('Failed to delete old receipt:', deleteResult.error);
          // Don't fail the request, just log it
        }
      }

      // Upload new receipt
      const uploadResult = await uploadReceipt(req.file.buffer, req.file.originalname);

      if (!uploadResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Failed to upload receipt: ' + uploadResult.error,
        });
      }

      expense.receiptUrl = uploadResult.url;
      expense.receiptFileId = uploadResult.fileId;
    }

    // Update fields
    if (quantity !== undefined) expense.quantity = quantity;
    if (unitCost !== undefined) expense.unitCost = unitCost;
    if (date !== undefined) expense.date = date;
    if (vendor !== undefined) expense.vendor = vendor;
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description;
    if (isRecurring !== undefined) expense.isRecurring = isRecurring;
    if (recurringType !== undefined) expense.recurringType = recurringType;
    if (recurringEndDate !== undefined) expense.recurringEndDate = recurringEndDate;

    if (req.body.medicineId !== undefined) {
      // Allow removing the medicine link
      expense.medicineId = req.body.medicineId === '' ? null : req.body.medicineId;
    }

    // Recalculate total cost
    if (expense.quantity && expense.unitCost) {
      expense.totalCost = expense.quantity * expense.unitCost;
    }

    await expense.save();

    // Update medicine stock if category is Medicine and medicine ID is present
    if (expense.category === 'Medicine' && expense.medicineId) {
       // If medicine ID changed, subtract from old, add to new
       if (oldMedicineId && oldMedicineId.toString() !== expense.medicineId.toString() && oldCategory === 'Medicine') {
         await Medicine.findByIdAndUpdate(oldMedicineId, { $inc: { quantity: -oldQuantity } });
         await Medicine.findByIdAndUpdate(expense.medicineId, { $inc: { quantity: expense.quantity } });
       } else {
         // Same medicine or new medicine, just adjust the difference
         const qtyDifference = expense.quantity - (oldMedicineId ? oldQuantity : 0);
         await Medicine.findByIdAndUpdate(expense.medicineId, { $inc: { quantity: qtyDifference } });
       }
    } else if (oldCategory === 'Medicine' && oldMedicineId && (expense.category !== 'Medicine' || !expense.medicineId)) {
       // It used to be a medicine expense, but now it's not (or medicine was removed). Revert the old stock.
       await Medicine.findByIdAndUpdate(oldMedicineId, { $inc: { quantity: -oldQuantity } });
    }

    // Update budget if amount or date changed
    const newMonthYear = expense.date.toISOString().slice(0, 7);
    const newTotal = expense.totalCost;
    const totalChange = newTotal - oldTotal;

    if (oldMonthYear === newMonthYear) {
      // Same month - just update amount
      await ExpenseBudget.findOneAndUpdate(
        { category: expense.category, monthYear: oldMonthYear },
        { $inc: { currentSpending: totalChange } },
        { new: true }
      );
    } else {
      // Different month - remove from old, add to new
      await ExpenseBudget.findOneAndUpdate(
        { category: expense.category, monthYear: oldMonthYear },
        { $inc: { currentSpending: -oldTotal } },
        { new: true }
      );
      await ExpenseBudget.findOneAndUpdate(
        { category: expense.category, monthYear: newMonthYear },
        { $inc: { currentSpending: newTotal } },
        { new: true }
      );
    }

    // Populate and return
    const updatedExpense = await Expense.findById(expense._id)
      .populate('medicineId', 'name category')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: updatedExpense,
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense',
      error: error.message,
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private/Admin
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Delete receipt from ImageKit if it exists
    if (expense.receiptFileId) {
      const deleteResult = await deleteReceipt(expense.receiptFileId);
      if (!deleteResult.success) {
        console.warn('Failed to delete receipt from ImageKit:', deleteResult.error);
        // Don't fail the request, just log it
      }
    }

    // Revert medicine stock if applicable
    if (expense.category === 'Medicine' && expense.medicineId) {
       await Medicine.findByIdAndUpdate(
         expense.medicineId,
         { $inc: { quantity: -expense.quantity } }
       );
    }

    // Update budget - subtract the expense amount
    const monthYear = expense.date.toISOString().slice(0, 7);
    const expenseTotal = expense.totalCost || (expense.quantity * expense.unitCost);

    await ExpenseBudget.findOneAndUpdate(
      { category: expense.category, monthYear },
      { $inc: { currentSpending: -expenseTotal } },
      { new: true }
    );

    // Delete the expense
    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense',
      error: error.message,
    });
  }
};
