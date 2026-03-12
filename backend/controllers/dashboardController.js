const Order = require('../models/Order');
const Expense = require('../models/Expense');
const Medicine = require('../models/Medicine');
const User = require('../models/User');

// @desc    Get aggregated stats for Admin Dashboard
// @route   GET /api/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        // Today from midnight to 11:59:59 PM
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        // Calculate Last 7 Days Date Range
        const startOfLast7Days = new Date();
        startOfLast7Days.setDate(now.getDate() - 6);
        startOfLast7Days.setHours(0, 0, 0, 0);

        // 1. Get Today's Revenue (Completed/Paid Orders)
        const todaysOrders = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfToday, $lt: endOfToday },
                    paymentStatus: 'paid' // Assuming revenue is only counted when paid
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPrice' }
                }
            }
        ]);
        const todaysRevenue = todaysOrders.length > 0 ? todaysOrders[0].totalRevenue : 0;

        // 2. Get Today's Expenses
        const todaysExpensesData = await Expense.aggregate([
            {
                $match: {
                    date: { $gte: startOfToday, $lt: endOfToday }
                }
            },
            {
                $group: {
                    _id: null,
                    totalExpenses: { $sum: '$totalCost' }
                }
            }
        ]);
        const todaysExpenses = todaysExpensesData.length > 0 ? todaysExpensesData[0].totalExpenses : 0;

        // 3. Get Pending Pickup Orders metric
        const pendingPickupCount = await Order.countDocuments({
            status: { $in: ['pending', 'confirmed', 'packed', 'ready_for_pickup'] }
        });

        // 4. Low Stock Medicine Alert metric (stock < 10)
        const lowStockCount = await Medicine.countDocuments({
            $or: [
                { quantity: { $lt: 10 } },
                { stockStatus: false }
            ]
        });

        // 5. Total Customers count
        const totalCustomersCount = await User.countDocuments({ role: 'patient' });

        // 6. Recent 5 Orders
        const recentOrders = await Order.find()
            .populate('patientId', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        // 7. Last 7 Days Sales Trend (Revenue vs Expenses)
        // Group Orders by Day
        const salesLast7Days = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfLast7Days, $lt: endOfToday },
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalPrice' }
                }
            }
        ]);
        
        // Group Expenses by Day
        const expensesLast7Days = await Expense.aggregate([
            {
                $match: {
                    date: { $gte: startOfLast7Days, $lt: endOfToday }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    expense: { $sum: '$totalCost' }
                }
            }
        ]);

        // Merge array maps into a structured daily format filling skipped days with 0
        const salesTrend = [];
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startOfLast7Days);
            currentDate.setDate(startOfLast7Days.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];
            
            // Format labels like 'Mon', 'Tue' for charts
            const dayLabel = currentDate.toLocaleDateString('en-US', { weekday: 'short' });

            const daySales = salesLast7Days.find(d => d._id === dateStr)?.revenue || 0;
            const dayExp = expensesLast7Days.find(d => d._id === dateStr)?.expense || 0;

            salesTrend.push({
                date: dateStr,
                name: dayLabel,
                revenue: daySales,
                expenses: dayExp
            });
        }

        res.status(200).json({
            success: true,
            data: {
                kpi: {
                    todaysRevenue,
                    todaysExpenses,
                    todaysProfit: todaysRevenue - todaysExpenses,
                    pendingOrders: pendingPickupCount,
                    lowStockItems: lowStockCount,
                    totalCustomers: totalCustomersCount
                },
                salesTrend,
                recentOrders
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard metrics. Please try again.',
            error: error.message
        });
    }
};
