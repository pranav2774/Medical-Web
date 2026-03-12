import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { Link } from 'react-router-dom';
import * as expenseService from '../utils/expenseService';

export default function BudgetSettings() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    category: '',
    monthYear: '',
    budgetAmount: '',
    alertThreshold: 80,
  });

  // Modal states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Categories for dropdown
  const categories = ['Medicine', 'Medical Supplies', 'Equipment', 'Repairs', 'Other'];

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  };

  // Fetch budgets for current month
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const monthYear = formData.monthYear || getCurrentMonth();
      const result = await expenseService.getBudgetsByMonth(monthYear);
      setBudgets(result.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch budgets');
      toast.error('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      monthYear: getCurrentMonth(),
    }));
  }, []);

  // Fetch when monthYear changes
  useEffect(() => {
    if (formData.monthYear) {
      fetchBudgets();
    }
  }, [formData.monthYear]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle set budget
  const handleSetBudget = async (e) => {
    e.preventDefault();

    if (!formData.category || !formData.monthYear || !formData.budgetAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const budgetData = {
        category: formData.category,
        monthYear: formData.monthYear,
        budgetAmount: parseFloat(formData.budgetAmount),
        alertThreshold: parseInt(formData.alertThreshold),
      };

      if (isEditing && selectedBudget) {
        await expenseService.updateBudget(selectedBudget._id, budgetData);
        toast.success('Budget updated successfully');
        setIsEditing(false);
      } else {
        await expenseService.setBudget(budgetData);
        toast.success('Budget set successfully');
      }

      // Reset form
      setFormData(prev => ({
        ...prev,
        category: '',
        budgetAmount: '',
        alertThreshold: 80,
      }));
      setSelectedBudget(null);
      fetchBudgets();
    } catch (err) {
      toast.error(err.message || 'Failed to set budget');
    }
  };

  // Handle edit budget
  const handleEditBudget = (budget) => {
    setFormData({
      category: budget.category,
      monthYear: budget.monthYear,
      budgetAmount: budget.budgetAmount.toString(),
      alertThreshold: budget.alertThreshold,
    });
    setSelectedBudget(budget);
    setIsEditing(true);
  };

  // Handle delete budget
  const handleDeleteBudget = async () => {
    try {
      await expenseService.deleteBudget(selectedBudget._id);
      toast.success('Budget deleted successfully');
      setShowDeleteDialog(false);
      fetchBudgets();
    } catch (err) {
      toast.error(err.message || 'Failed to delete budget');
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedBudget(null);
    setFormData(prev => ({
      ...prev,
      category: '',
      budgetAmount: '',
      alertThreshold: 80,
    }));
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Get budget status
  const getBudgetStatus = (budget) => {
    if (budget.isExceeded) return 'EXCEEDED';
    const percentage = (budget.currentSpending / budget.budgetAmount) * 100;
    if (percentage >= budget.alertThreshold) return 'WARNING';
    return 'OK';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'EXCEEDED':
        return 'bg-red-100 text-red-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Settings</h1>
        <p className="text-gray-600">Configure monthly budgets and spending alerts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Budget Form */}
        <div className="lg:col-span-1">
          <div className="card p-6 bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {isEditing ? 'Edit Budget' : 'Set Budget Allocation'}
            </h2>

            <form onSubmit={handleSetBudget} className="space-y-5">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month *
                </label>
                <input
                  type="month"
                  name="monthYear"
                  value={formData.monthYear}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Budget Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Amount ($) *
                </label>
                <input
                  type="number"
                  name="budgetAmount"
                  value={formData.budgetAmount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Alert Threshold */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Threshold (%) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    name="alertThreshold"
                    value={formData.alertThreshold}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="5"
                    className="flex-1"
                  />
                  <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-lg">
                    {formData.alertThreshold}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Alert will trigger when spending reaches {formData.alertThreshold}% of budget
                </p>
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <button
                  type="submit"
                  className="w-full btn-primary py-2 px-4 transition"
                >
                  {isEditing ? 'Update Budget' : 'Set Budget'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Budgets List */}
        <div className="lg:col-span-2">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="text-gray-600 mt-4">Loading budgets...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Month Display */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Budgets for {new Date(`${formData.monthYear}-01`).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </h2>
              </div>

              {budgets.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </div>
                  <p className="text-gray-800 font-semibold text-lg">No budget allocated for this month</p>
                  <p className="text-gray-500 text-sm mt-1">Use the panel on the left to set category budgets.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgets.map(budget => {
                    const status = getBudgetStatus(budget);
                    const percentage = (budget.currentSpending / budget.budgetAmount) * 100;

                    return (
                      <div key={budget._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition hover:shadow-md">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${
                              status === 'EXCEEDED' ? 'bg-red-50 text-red-600' :
                              status === 'WARNING' ? 'bg-yellow-50 text-yellow-600' :
                              'bg-green-50 text-green-600'
                            }`}>
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{budget.category}</h3>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
                                Alert at {budget.alertThreshold}% usage
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {formatCurrency(budget.currentSpending)} / {formatCurrency(budget.budgetAmount)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                status === 'EXCEEDED' ? 'bg-red-600' :
                                status === 'WARNING' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Remaining Budget */}
                        <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                          <p className="text-sm text-primary-700">
                            <span className="font-medium">Remaining:</span> {formatCurrency(Math.max(0, budget.budgetAmount - budget.currentSpending))}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditBudget(budget)}
                            className="flex-1 bg-primary-100 hover:bg-primary-200 text-primary-700 font-medium py-2 px-4 rounded-lg transition text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBudget(budget);
                              setShowDeleteDialog(true);
                            }}
                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteDialog && selectedBudget && (
        <DeleteConfirmDialog
          title="Delete Budget"
          message={`Are you sure you want to delete the budget for ${selectedBudget.category} in ${selectedBudget.monthYear}? This action cannot be undone.`}
          onConfirm={handleDeleteBudget}
          onCancel={() => {
            setShowDeleteDialog(false);
            setSelectedBudget(null);
          }}
        />
      )}
    </div>
  );
}
