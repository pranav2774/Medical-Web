const ExpenseBudget = require('../models/ExpenseBudget');
const Expense = require('../models/Expense');

// @desc    Set or update budget for a category and month
// @route   POST /api/expenses/budget
// @access  Private/Admin
exports.setBudget = async (req, res) => {
  try {
    const { category, monthYear, budgetAmount, alertThreshold } = req.body;

    // Check if budget already exists for this category and month
    let budget = await ExpenseBudget.findOne({ category, monthYear });

    if (budget) {
      // Update existing budget
      budget.budgetAmount = budgetAmount || budget.budgetAmount;
      if (alertThreshold !== undefined) {
        budget.alertThreshold = alertThreshold;
      }
      await budget.save();
    } else {
      // Create new budget
      budget = await ExpenseBudget.create({
        category,
        monthYear,
        budgetAmount,
        alertThreshold: alertThreshold || 80,
        createdBy: req.user.id,
      });
    }

    // Check if alert should be triggered
    budget.alertTriggered = budget.shouldTriggerAlert();
    await budget.save();

    res.status(201).json({
      success: true,
      message: budget._id ? 'Budget updated successfully' : 'Budget created successfully',
      data: budget,
    });
  } catch (error) {
    console.error('Set budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting budget',
      error: error.message,
    });
  }
};

// @desc    Get budget for specific month/category
// @route   GET /api/expenses/budget
// @access  Private/Admin
exports.getBudget = async (req, res) => {
  try {
    const { category, monthYear } = req.query;

    if (!category || !monthYear) {
      return res.status(400).json({
        success: false,
        message: 'Category and monthYear are required',
      });
    }

    const budget = await ExpenseBudget.findOne({ category, monthYear });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    // Calculate current status
    const percentageSpent = budget.getPercentageSpent();
    const isExceeded = budget.isExceeded();
    const shouldAlert = budget.shouldTriggerAlert();

    res.status(200).json({
      success: true,
      data: {
        ...budget.toObject(),
        percentageSpent,
        isExceeded,
        shouldAlert,
        remainingBudget: Math.max(0, budget.budgetAmount - budget.currentSpending),
      },
    });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budget',
      error: error.message,
    });
  }
};

// @desc    Get all budgets for a specific month
// @route   GET /api/expenses/budget/month/:monthYear
// @access  Private/Admin
exports.getBudgetsByMonth = async (req, res) => {
  try {
    const { monthYear } = req.params;

    const budgets = await ExpenseBudget.find({ monthYear });

    // Enrich with status information
    const enrichedBudgets = budgets.map(budget => ({
      ...budget.toObject(),
      percentageSpent: budget.getPercentageSpent(),
      isExceeded: budget.isExceeded(),
      shouldAlert: budget.shouldTriggerAlert(),
      remainingBudget: Math.max(0, budget.budgetAmount - budget.currentSpending),
    }));

    res.status(200).json({
      success: true,
      count: enrichedBudgets.length,
      data: enrichedBudgets,
    });
  } catch (error) {
    console.error('Get budgets by month error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budgets',
      error: error.message,
    });
  }
};

// @desc    Check budget status - identify over budget items
// @route   GET /api/expenses/budget/check
// @access  Private/Admin
exports.checkBudgetStatus = async (req, res) => {
  try {
    const { month } = req.query;
    let monthYear = month;

    // If no month provided, use current month
    if (!monthYear) {
      const now = new Date();
      monthYear = now.toISOString().slice(0, 7);
    }

    // Get all budgets for this month
    const budgets = await ExpenseBudget.find({ monthYear });

    // Check which ones are over budget or near alert
    const budgetStatus = budgets.map(budget => ({
      category: budget.category,
      budgetAmount: budget.budgetAmount,
      currentSpending: budget.currentSpending,
      percentageSpent: budget.getPercentageSpent(),
      alertThreshold: budget.alertThreshold,
      isExceeded: budget.isExceeded(),
      shouldAlert: budget.shouldTriggerAlert(),
      remainingBudget: Math.max(0, budget.budgetAmount - budget.currentSpending),
      status: budget.isExceeded() ? 'EXCEEDED' : budget.shouldTriggerAlert() ? 'WARNING' : 'OK',
    }));

    // Separate alerts and warnings
    const exceeded = budgetStatus.filter(b => b.isExceeded);
    const warnings = budgetStatus.filter(b => b.shouldAlert && !b.isExceeded);
    const okay = budgetStatus.filter(b => !b.isExceeded && !b.shouldAlert);

    res.status(200).json({
      success: true,
      month: monthYear,
      summary: {
        totalBudgets: budgetStatus.length,
        exceeded: exceeded.length,
        warnings: warnings.length,
        okay: okay.length,
      },
      exceeded,
      warnings,
      okay,
      all: budgetStatus,
    });
  } catch (error) {
    console.error('Check budget status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking budget status',
      error: error.message,
    });
  }
};

// @desc    Update budget alert status
// @route   PUT /api/expenses/budget/:id
// @access  Private/Admin
exports.updateBudget = async (req, res) => {
  try {
    const { budgetAmount, alertThreshold } = req.body;
    const budget = await ExpenseBudget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    if (budgetAmount !== undefined) budget.budgetAmount = budgetAmount;
    if (alertThreshold !== undefined) budget.alertThreshold = alertThreshold;

    // Recalculate alert status
    budget.alertTriggered = budget.shouldTriggerAlert();

    await budget.save();

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: budget,
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating budget',
      error: error.message,
    });
  }
};

// @desc    Delete budget
// @route   DELETE /api/expenses/budget/:id
// @access  Private/Admin
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await ExpenseBudget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting budget',
      error: error.message,
    });
  }
};
