const Expense = require('../models/Expense');
const ExpenseBudget = require('../models/ExpenseBudget');

// @desc    Get monthly spending trend
// @route   GET /api/expenses/analytics/monthly
// @access  Private/Admin
exports.getMonthlyTrend = async (req, res) => {
  try {
    const { months = 12 } = req.query;

    // Calculate date range for last N months
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months) + 1);
    startDate.setDate(1);

    // Aggregate expenses by month
    const monthlyData = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalSpent: { $sum: '$totalCost' },
          count: { $sum: 1 },
          avgCost: { $avg: '$totalCost' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Format the data for chart
    const formattedData = monthlyData.map(item => {
      const date = new Date(item._id.year, item._id.month - 1);
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        monthYear: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        total: item.totalSpent,
        count: item.count,
        avgCost: Math.round(item.avgCost),
      };
    });

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error('Get monthly trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly trend',
      error: error.message,
    });
  }
};

// @desc    Get category-wise breakdown
// @route   GET /api/expenses/analytics/category
// @access  Private/Admin
exports.getCategoryBreakdown = async (req, res) => {
  try {
    const { monthYear } = req.query;

    let matchStage = {};

    if (monthYear) {
      // Filter by specific month
      const [year, month] = monthYear.split('-');
      const startDate = new Date(year, parseInt(month) - 1, 1);
      const endDate = new Date(year, parseInt(month), 0);

      matchStage = {
        date: { $gte: startDate, $lte: endDate },
      };
    }

    // Aggregate by category
    const categoryData = await Expense.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$totalCost' },
          count: { $sum: 1 },
          avgCost: { $avg: '$totalCost' },
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
    ]);

    // Format data for pie chart
    const formattedData = categoryData.map(item => ({
      category: item._id || 'Unknown',
      total: item.totalSpent,
      count: item.count,
      percentage: 0, // Will calculate below
    }));

    // Calculate percentages
    const totalSpent = formattedData.reduce((sum, item) => sum + item.total, 0);
    formattedData.forEach(item => {
      item.percentage = totalSpent > 0 ? Math.round((item.total / totalSpent) * 100) : 0;
    });

    res.status(200).json({
      success: true,
      total: totalSpent,
      data: formattedData,
    });
  } catch (error) {
    console.error('Get category breakdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category breakdown',
      error: error.message,
    });
  }
};

// @desc    Get KPI data for dashboard
// @route   GET /api/expenses/analytics/kpi
// @access  Private/Admin
exports.getKPIData = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);

    // Current month start and end
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Previous month
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month total
    const currentMonthSpending = await Expense.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: monthEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalCost' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Previous month total
    const prevMonthSpending = await Expense.aggregate([
      {
        $match: {
          date: { $gte: prevStart, $lte: prevEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalCost' },
        },
      },
    ]);

    const currentTotal = currentMonthSpending[0]?.total || 0;
    const prevTotal = prevMonthSpending[0]?.total || 0;
    const monthlyChangePercent = prevTotal > 0 ? Math.round(((currentTotal - prevTotal) / prevTotal) * 100) : 0;

    // Top vendor this month
    const topVendor = await Expense.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: monthEnd },
        },
      },
      {
        $group: {
          _id: '$vendor',
          totalSpent: { $sum: '$totalCost' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    // Most expensive category
    const topCategory = await Expense.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: monthEnd },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$totalCost' },
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    // Budget status
    const budgetStatus = await ExpenseBudget.find({ monthYear: currentMonth });
    let budgetExceeded = 0;
    let budgetWarnings = 0;

    budgetStatus.forEach(budget => {
      if (budget.isExceeded()) {
        budgetExceeded++;
      } else if (budget.shouldTriggerAlert()) {
        budgetWarnings++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalExpensesCurrentMonth: Math.round(currentTotal),
        previousMonthSpending: Math.round(prevTotal),
        monthOverMonthChange: monthlyChangePercent,
        changeDirection: monthlyChangePercent >= 0 ? 'up' : 'down',
        expenseCount: currentMonthSpending[0]?.count || 0,
        topVendor: {
          name: topVendor[0]?._id || 'N/A',
          amount: Math.round(topVendor[0]?.totalSpent || 0),
          count: topVendor[0]?.count || 0,
        },
        topCategory: {
          category: topCategory[0]?._id || 'N/A',
          amount: Math.round(topCategory[0]?.totalSpent || 0),
        },
        budgetStatus: {
          total: budgetStatus.length,
          exceeded: budgetExceeded,
          warnings: budgetWarnings,
          okay: budgetStatus.length - budgetExceeded - budgetWarnings,
        },
      },
    });
  } catch (error) {
    console.error('Get KPI data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching KPI data',
      error: error.message,
    });
  }
};

// @desc    Get expenses for comparison (budget vs actual)
// @route   GET /api/expenses/analytics/budget-vs-actual
// @access  Private/Admin
exports.getBudgetVsActual = async (req, res) => {
  try {
    const { monthYear } = req.query;

    let month = monthYear;
    if (!month) {
      const now = new Date();
      month = now.toISOString().slice(0, 7);
    }

    // Get budgets and expenses for this month
    const budgets = await ExpenseBudget.find({ monthYear: month });
    const [year, monthNum] = month.split('-');
    const startDate = new Date(year, parseInt(monthNum) - 1, 1);
    const endDate = new Date(year, parseInt(monthNum), 0);

    const expenses = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          actualSpent: { $sum: '$totalCost' },
        },
      },
    ]);

    // Combine budget and actual
    const comparisonData = budgets.map(budget => {
      const actualExpense = expenses.find(e => e._id === budget.category);
      const actualSpent = actualExpense?.actualSpent || 0;

      return {
        category: budget.category,
        budgeted: budget.budgetAmount,
        actual: actualSpent,
        variance: budget.budgetAmount - actualSpent,
        variancePercent: Math.round(((budget.budgetAmount - actualSpent) / budget.budgetAmount) * 100),
        status: actualSpent > budget.budgetAmount ? 'EXCEEDED' : 'OK',
      };
    });

    res.status(200).json({
      success: true,
      month,
      data: comparisonData,
    });
  } catch (error) {
    console.error('Get budget vs actual error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching budget vs actual',
      error: error.message,
    });
  }
};

// @desc    Export expenses to CSV
// @route   POST /api/expenses/export/csv
// @access  Private/Admin
exports.exportToCSV = async (req, res) => {
  try {
    const {
      category,
      dateFrom,
      dateTo,
      vendor,
    } = req.body;

    // Build query
    const query = {};

    if (category) query.category = category;
    if (vendor) query.vendor = { $regex: vendor, $options: 'i' };

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    // Fetch expenses
    const expenses = await Expense.find(query).sort({ date: -1 });

    if (expenses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No expenses found for the given criteria',
      });
    }

    // CSV header
    const headers = ['Date', 'Vendor', 'Category', 'Quantity', 'Unit Cost', 'Total Cost', 'Description', 'Receipt URL'];
    const rows = expenses.map(expense => [
      new Date(expense.date).toLocaleDateString('en-IN'),
      expense.vendor,
      expense.category,
      expense.quantity,
      expense.unitCost.toFixed(2),
      expense.totalCost.toFixed(2),
      expense.description || '',
      expense.receiptUrl || '',
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv;charset=utf-8;');
    res.setHeader('Content-Disposition', `attachment; filename="expenses_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Export to CSV error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting expenses',
      error: error.message,
    });
  }
};
