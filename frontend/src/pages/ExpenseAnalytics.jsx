import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import * as expenseService from '../utils/expenseService';

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Expense Analytics</h1>
        <p className="text-gray-600">View insights and trends for your expenses</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <input
              type="month"
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trend Period</label>
            <select
              value={filters.months}
              onChange={(e) => setFilters({ ...filters, months: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Expenses</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {formatCurrency(kpiData.totalExpensesCurrentMonth || 0)}
                    </h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
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
              <div className="bg-white rounded-lg shadow p-6">
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
              <div className="bg-white rounded-lg shadow p-6">
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
              <div className="bg-white rounded-lg shadow p-6">
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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h2>
              {monthlyTrend.length > 0 ? (
                <div className="space-y-2">
                  {monthlyTrend.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-gray-600">{item.month}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full transition-all"
                          style={{ width: `${(item.total / Math.max(...monthlyTrend.map(m => m.total))) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 w-24 text-right">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h2>
              {categoryBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {categoryBreakdown.map((item, index) => {
                    const colors = [
                      'bg-blue-500',
                      'bg-purple-500',
                      'bg-pink-500',
                      'bg-green-500',
                      'bg-yellow-500',
                    ];
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{item.category}</span>
                          <span className="text-sm text-gray-600">{formatPercent(item.percentage)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${colors[index % colors.length]}`}
                            style={{ width: `${item.percentage || 0}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{formatCurrency(item.total)}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>

            {/* Budget vs Actual */}
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
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
