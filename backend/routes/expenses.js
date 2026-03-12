const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { expenseValidation, budgetValidation, validate } = require('../middleware/expenseValidation');
const { uploadReceipt, validateReceiptFile, handleUploadError } = require('../middleware/receiptUpload');
const {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const {
  setBudget,
  getBudget,
  getBudgetsByMonth,
  checkBudgetStatus,
  updateBudget,
  deleteBudget,
} = require('../controllers/expenseBudgetController');
const {
  getMonthlyTrend,
  getCategoryBreakdown,
  getKPIData,
  getBudgetVsActual,
  exportToCSV,
} = require('../controllers/expenseAnalyticsController');

// Apply auth and admin-only middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// ==================== EXPENSE ROUTES ====================

/**
 * @route   GET /api/expenses
 * @desc    Get all expenses with filters and pagination
 * @access  Private/Admin
 */
router.get('/', getAllExpenses);

/**
 * @route   POST /api/expenses
 * @desc    Create new expense with optional receipt upload
 * @access  Private/Admin
 */
router.post('/', uploadReceipt, handleUploadError, validateReceiptFile, expenseValidation, validate, createExpense);

/**
 * @route   GET /api/expenses/:id
 * @desc    Get single expense by ID
 * @access  Private/Admin
 */
router.get('/:id', getExpenseById);

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update expense with optional receipt replacement
 * @access  Private/Admin
 */
router.put('/:id', uploadReceipt, handleUploadError, validateReceiptFile, expenseValidation, validate, updateExpense);

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete expense
 * @access  Private/Admin
 */
router.delete('/:id', deleteExpense);

// ==================== BUDGET ROUTES ====================

/**
 * @route   POST /api/expenses/budget
 * @desc    Set or update budget
 * @access  Private/Admin
 */
router.post('/budget', budgetValidation, validate, setBudget);

/**
 * @route   GET /api/expenses/budget
 * @desc    Get budget for specific month/category
 * @access  Private/Admin
 */
router.get('/budget', getBudget);

/**
 * @route   GET /api/expenses/budget/month/:monthYear
 * @desc    Get all budgets for a specific month
 * @access  Private/Admin
 */
router.get('/budget/month/:monthYear', getBudgetsByMonth);

/**
 * @route   GET /api/expenses/budget/check
 * @desc    Check if budget is exceeded
 * @access  Private/Admin
 */
router.get('/budget/check', checkBudgetStatus);

/**
 * @route   PUT /api/expenses/budget/:id
 * @desc    Update budget
 * @access  Private/Admin
 */
router.put('/budget/:id', updateBudget);

/**
 * @route   DELETE /api/expenses/budget/:id
 * @desc    Delete budget
 * @access  Private/Admin
 */
router.delete('/budget/:id', deleteBudget);

// ==================== ANALYTICS ROUTES ====================

/**
 * @route   GET /api/expenses/analytics/monthly
 * @desc    Get monthly spending trend
 * @access  Private/Admin
 */
router.get('/analytics/monthly', getMonthlyTrend);

/**
 * @route   GET /api/expenses/analytics/category
 * @desc    Get category-wise breakdown
 * @access  Private/Admin
 */
router.get('/analytics/category', getCategoryBreakdown);

/**
 * @route   GET /api/expenses/analytics/kpi
 * @desc    Get KPI data for dashboard
 * @access  Private/Admin
 */
router.get('/analytics/kpi', getKPIData);

/**
 * @route   GET /api/expenses/analytics/budget-vs-actual
 * @desc    Get budget vs actual comparison
 * @access  Private/Admin
 */
router.get('/analytics/budget-vs-actual', getBudgetVsActual);

// ==================== EXPORT ROUTES ====================

/**
 * @route   POST /api/expenses/export/csv
 * @desc    Export expenses as CSV
 * @access  Private/Admin
 */
router.post('/export/csv', exportToCSV);

module.exports = router;
