import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AddExpenseModal from '../components/AddExpenseModal';
import EditExpenseModal from '../components/EditExpenseModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import * as expenseService from '../utils/expenseService';

export default function AdminExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    category: '',
    dateFrom: '',
    dateTo: '',
    searchVendor: '',
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // Selected expense
  const [selectedExpense, setSelectedExpense] = useState(null);
  
  // Categories for filter dropdown
  const categories = ['Medicine', 'Medical Supplies', 'Equipment', 'Repairs', 'Other'];

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit,
        ...(filters.category && { category: filters.category }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.searchVendor && { vendor: filters.searchVendor }),
      };
      
      const result = await expenseService.getAllExpenses(params);
      setExpenses(result.expenses || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch expenses');
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and on filter/page change
  useEffect(() => {
    fetchExpenses();
  }, [filters, page]);

  // Handle add expense
  const handleAddExpense = async (expenseData) => {
    try {
      await expenseService.createExpense(expenseData);
      toast.success('Expense added successfully');
      setShowAddModal(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.message || 'Failed to add expense');
    }
  };

  // Handle edit expense
  const handleEditExpense = async (id, expenseData) => {
    try {
      await expenseService.updateExpense(id, expenseData);
      toast.success('Expense updated successfully');
      setShowEditModal(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.message || 'Failed to update expense');
    }
  };

  // Handle delete expense
  const handleDeleteExpense = async () => {
    try {
      await expenseService.deleteExpense(selectedExpense._id);
      toast.success('Expense deleted successfully');
      setShowDeleteDialog(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.message || 'Failed to delete expense');
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page on filter change
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      category: '',
      dateFrom: '',
      dateTo: '',
      searchVendor: '',
    });
    setPage(1);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Expense Management</h1>
        <p className="text-gray-600">Track and manage all business expenses</p>
      </div>

      {/* Add Expense Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          + Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Vendor Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
            <input
              type="text"
              name="searchVendor"
              value={filters.searchVendor}
              onChange={handleFilterChange}
              placeholder="Search vendor..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={handleClearFilters}
          className="mt-4 text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Clear All Filters
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading expenses...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Expenses Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No expenses found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or add a new expense</p>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Unit Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Receipt</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map(expense => (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.vendor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(expense.unitCost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(expense.totalCost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {expense.receiptUrl ? (
                          <a
                            href={expense.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => {
                            setSelectedExpense(expense);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedExpense(expense);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Page {page} • Showing up to {limit} expenses
                </p>
                <div className="space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={expenses.length < limit}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddExpenseModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddExpense}
        />
      )}

      {showEditModal && selectedExpense && (
        <EditExpenseModal
          expense={selectedExpense}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditExpense}
        />
      )}

      {showDeleteDialog && selectedExpense && (
        <DeleteConfirmDialog
          title="Delete Expense"
          message={`Are you sure you want to delete the expense from ${selectedExpense.vendor} on ${formatDate(selectedExpense.date)}? This action cannot be undone.`}
          onConfirm={handleDeleteExpense}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}
