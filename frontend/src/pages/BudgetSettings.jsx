import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { Link } from 'react-router-dom';
import * as expenseService from '../utils/expenseService';
import AdminNavbar from '../components/AdminNavbar';

export default function BudgetSettings() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    category: '',
    monthYear: '',
    budgetAmount: '',
    alertThreshold: 80,
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const categories = ['Medicine', 'Medical Supplies', 'Equipment', 'Repairs', 'Other'];

  const getCurrentMonth = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  };

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

  useEffect(() => {
    setFormData(prev => ({ ...prev, monthYear: getCurrentMonth() }));
  }, []);

  useEffect(() => {
    if (formData.monthYear) fetchBudgets();
  }, [formData.monthYear]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
      setFormData(prev => ({ ...prev, category: '', budgetAmount: '', alertThreshold: 80 }));
      setSelectedBudget(null);
      fetchBudgets();
    } catch (err) {
      toast.error(err.message || 'Failed to set budget');
    }
  };

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

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedBudget(null);
    setFormData(prev => ({ ...prev, category: '', budgetAmount: '', alertThreshold: 80 }));
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const getBudgetStatus = (budget) => {
    if (budget.isExceeded) return 'EXCEEDED';
    const percentage = (budget.currentSpending / budget.budgetAmount) * 100;
    if (percentage >= budget.alertThreshold) return 'WARNING';
    return 'OK';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'EXCEEDED': return 'bg-red-50 text-red-700 border border-red-200';
      case 'WARNING': return 'bg-amber-50 text-amber-700 border border-amber-200';
      default: return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    }
  };

  const getIconStyle = (status) => {
    switch (status) {
      case 'EXCEEDED': return 'bg-red-100 text-red-600';
      case 'WARNING': return 'bg-amber-100 text-amber-600';
      default: return 'bg-emerald-100 text-emerald-600';
    }
  };

  const getBarColor = (status) => {
    switch (status) {
      case 'EXCEEDED': return 'bg-red-500';
      case 'WARNING': return 'bg-amber-400';
      default: return 'bg-emerald-500';
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <AdminNavbar pageTitle="Budget Settings" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 bg-primary-600 rounded-full"></div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Budget Settings</h1>
          </div>
          <p className="text-gray-500 text-sm ml-4">Configure monthly category budgets and spending thresholds</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Budget Form */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm sticky top-6">
              {/* Form header accent */}
              <div className="h-1 bg-primary-600 rounded-t-sm"></div>
              <div className="p-6">
                <h2 className="text-base font-bold text-gray-900 tracking-tight mb-5">
                  {isEditing ? '✏️ Edit Budget' : '+ Set Budget Allocation'}
                </h2>

                <form onSubmit={handleSetBudget} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                    >
                      <option value="">Select category...</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Month *
                    </label>
                    <input
                      type="month"
                      name="monthYear"
                      value={formData.monthYear}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Budget Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="budgetAmount"
                      value={formData.budgetAmount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Alert Threshold — <span className="text-primary-600 font-bold">{formData.alertThreshold}%</span>
                    </label>
                    <input
                      type="range"
                      name="alertThreshold"
                      value={formData.alertThreshold}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="5"
                      className="w-full accent-primary-600"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Alert triggers at {formData.alertThreshold}% of budget used
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="submit"
                      className="w-full py-2 px-4 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-sm transition-colors"
                    >
                      {isEditing ? 'Update Budget' : 'Set Budget'}
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="w-full py-2 px-4 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Budgets List */}
          <div className="lg:col-span-2">
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                <p className="text-gray-500 mt-4 text-sm">Loading budgets...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-sm p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    {new Date(`${formData.monthYear}-01`).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </h2>
                  <span className="text-xs text-gray-400">{budgets.length} {budgets.length === 1 ? 'budget' : 'budgets'}</span>
                </div>

                {budgets.length === 0 ? (
                  <div className="bg-white border border-dashed border-gray-300 rounded-sm p-12 text-center">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-gray-700 font-semibold text-sm">No budgets set for this month</p>
                    <p className="text-gray-400 text-xs mt-1">Use the form to allocate category budgets.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {budgets.map(budget => {
                      const status = getBudgetStatus(budget);
                      const percentage = Math.min((budget.currentSpending / budget.budgetAmount) * 100, 100);

                      return (
                        <div key={budget._id} className="bg-white border border-gray-200 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                          {/* Left accent bar based on status */}
                          <div className={`h-1 rounded-t-sm ${status === 'EXCEEDED' ? 'bg-red-500' :
                              status === 'WARNING' ? 'bg-amber-400' : 'bg-emerald-500'
                            }`}></div>
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-sm ${getIconStyle(status)}`}>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <h3 className="text-base font-bold text-gray-900">{budget.category}</h3>
                                  <p className="text-xs text-gray-400 mt-0.5">Alert at {budget.alertThreshold}% usage</p>
                                </div>
                              </div>
                              <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-sm ${getStatusStyle(status)}`}>
                                {status}
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-3">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm font-medium text-gray-700">
                                  {formatCurrency(budget.currentSpending)}
                                  <span className="text-gray-400 text-xs"> / {formatCurrency(budget.budgetAmount)}</span>
                                </span>
                                <span className="text-xs font-semibold text-gray-500">{Math.round(percentage)}%</span>
                              </div>
                              <div className="w-full bg-gray-100 h-1.5 rounded-full">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${getBarColor(status)}`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Remaining */}
                            <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-sm">
                              <span className="text-xs text-gray-500 font-medium">Remaining Budget</span>
                              <span className={`text-sm font-bold ${status === 'EXCEEDED' ? 'text-red-600' : 'text-emerald-600'
                                }`}>
                                {formatCurrency(Math.max(0, budget.budgetAmount - budget.currentSpending))}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditBudget(budget)}
                                className="flex-1 py-1.5 px-3 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-sm transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => { setSelectedBudget(budget); setShowDeleteDialog(true); }}
                                className="flex-1 py-1.5 px-3 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-sm transition-colors"
                              >
                                Delete
                              </button>
                            </div>
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
      </div>

      {showDeleteDialog && selectedBudget && (
        <DeleteConfirmDialog
          title="Delete Budget"
          message={`Are you sure you want to delete the budget for ${selectedBudget.category} in ${selectedBudget.monthYear}? This action cannot be undone.`}
          onConfirm={handleDeleteBudget}
          onCancel={() => { setShowDeleteDialog(false); setSelectedBudget(null); }}
        />
      )}
    </div>
  );
}
