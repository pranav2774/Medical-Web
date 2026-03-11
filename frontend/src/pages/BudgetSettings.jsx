import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
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
      setBudgets(result.budgets || []);
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Settings</h1>
        <p className="text-gray-600">Configure monthly budgets and spending alerts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {isEditing ? 'Edit Budget' : 'Set Budget'}
            </h2>

            <form onSubmit={handleSetBudget}>
              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
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
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-500 text-lg">No budgets set for this month</p>
                  <p className="text-gray-400 text-sm mt-1">Add a budget to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgets.map(budget => {
                    const status = getBudgetStatus(budget);
                    const percentage = (budget.currentSpending / budget.budgetAmount) * 100;

                    return (
                      <div key={budget._id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
                            <p className="text-sm text-gray-600">
                              Alert at {budget.alertThreshold}%
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(status)}`}>
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
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">
                            <span className="font-medium">Remaining:</span> {formatCurrency(Math.max(0, budget.budgetAmount - budget.currentSpending))}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditBudget(budget)}
                            className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition text-sm"
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
