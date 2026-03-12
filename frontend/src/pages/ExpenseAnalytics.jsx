import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import * as expenseService from '../utils/expenseService';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#818cf8', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#f87171', '#60a5fa'];

export default function ExpenseAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // KPI Data
  const [kpiData, setKpiData] = useState(null);
  
  // Chart Data
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [budgetVsActual, setBudgetVsActual] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    month: new Date().toISOString().slice(0, 7),
    months: 12,
  });

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [kpi, trend, categories, budgetCompare] = await Promise.all([
        expenseService.getKPIData(),
        expenseService.getMonthlyTrend(filters.months),
        expenseService.getCategoryBreakdown(filters.month),
        expenseService.getBudgetVsActual(filters.month),
      ]);

      setKpiData(kpi);
      setMonthlyTrend(trend.data || []);
      setCategoryBreakdown(categories.data || []);
      setBudgetVsActual(budgetCompare.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics');
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Format percentage
  const formatPercent = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      await expenseService.exportExpensesToCSV({
        dateFrom: filters.month ? `${filters.month}-01` : undefined,
        dateTo: filters.month ? new Date(`${filters.month}-01`).toISOString().split('T')[0] : undefined,
      });
      toast.success('CSV exported successfully');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-gradient-to-br from-primary-50 to-white min-h-screen">
      {/* Back Button */}
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 text-sm font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Expense Analytics</h1>
        <p className="text-gray-600">View insights and trends for your expenses</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <input
              type="month"
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trend Period</label>
            <select
              value={filters.months}
              onChange={(e) => setFilters({ ...filters, months: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={3}>Last 3 months</option>
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
            </select>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              📊 Export CSV
            </button>
            <button
              onClick={fetchAnalytics}
              className="flex-1 btn-primary py-2 px-4 transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-600 mt-4">Loading analytics...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* KPI Cards */}
          {kpiData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Expenses */}
              <div className="card p-6 border-l-4 border-primary-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Expenses</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {formatCurrency(kpiData.totalExpensesCurrentMonth || 0)}
                    </h3>
                  </div>
                  <div className="bg-primary-100 p-3 rounded-lg">
                    <span className="text-xl">💰</span>
                  </div>
                </div>
                <p className={`text-sm ${
                  (kpiData.monthOverMonthChange || 0) >= 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {(kpiData.monthOverMonthChange || 0) >= 0 ? '+' : ''}{formatPercent(kpiData.monthOverMonthChange)}
                </p>
                <p className="text-xs text-gray-500 mt-1">vs last month</p>
              </div>

              {/* Top Vendor */}
              <div className="card p-6 border-l-4 border-purple-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Top Vendor</p>
                    <h3 className="text-lg font-bold text-gray-900">
                      {kpiData.topVendor?.name || 'N/A'}
                    </h3>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <span className="text-xl">🏪</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {formatCurrency(kpiData.topVendor?.amount || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">spent this month</p>
              </div>

              {/* Top Category */}
              <div className="card p-6 border-l-4 border-green-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Top Category</p>
                    <h3 className="text-lg font-bold text-gray-900">
                      {kpiData.topCategory?.category || 'N/A'}
                    </h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <span className="text-xl">📦</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {formatCurrency(kpiData.topCategory?.amount || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">spent this month</p>
              </div>

              {/* Budget Status */}
              <div className="card p-6 border-l-4 border-orange-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Budget Status</p>
                    <h3 className="text-lg font-bold text-gray-900">
                      {kpiData.budgetStatus?.exceeded === 0 ? '✓ On Track' : '⚠ Alert'}
                    </h3>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <span className="text-xl">📈</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {kpiData.budgetStatus?.exceeded || 0} categories over budget
                </p>
                <p className="text-xs text-gray-500 mt-1">this month</p>
              </div>
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <div className="card p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Monthly Trend (Last {filters.months} Months)</h2>
              {monthlyTrend.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyTrend}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip
                        cursor={{fill: '#f9fafb'}}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        formatter={(value) => [`₹${value}`, 'Total']}
                      />
                      <Bar dataKey="total" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-500">No data available for the selected period.</p>
              )}
            </div>

            {/* Category Breakdown */}
            <div className="card p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Category Breakdown</h2>
              {categoryBreakdown.length > 0 ? (
                 <div className="h-[300px] w-full flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryBreakdown}
                          cx="50%"
                          cy="45%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="total"
                          nameKey="category"
                        >
                          {categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            formatter={(value) => [`₹${value}`, 'Total Spent']}
                        />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
              ) : (
                <p className="text-gray-500">No data available for the selected month.</p>
              )}
            </div>

            {/* Budget vs Actual */}
            <div className="card p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual Spending</h2>
              {budgetVsActual.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {budgetVsActual.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm">{item.category}</h3>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-600">Actual</span>
                          <span className="text-xs font-semibold text-gray-900">
                            {formatCurrency(item.actual)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.actual > item.budget ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((item.actual / item.budget) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Budget */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(item.budget)}
                        </span>
                      </div>

                      {/* Remaining/Over */}
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className={`text-xs font-semibold ${
                          item.actual > item.budget ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {item.actual > item.budget ? '+' : '-'}{formatCurrency(Math.abs(item.budget - item.actual))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No budget data available. Set budgets to track spending.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
