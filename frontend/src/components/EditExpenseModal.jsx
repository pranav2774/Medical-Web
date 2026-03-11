import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { medicineService } from '../utils/medicineService';

export default function EditExpenseModal({ expense, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    quantity: expense.quantity,
    unitCost: expense.unitCost,
    date: expense.date.split('T')[0],
    vendor: expense.vendor,
    category: expense.category,
    medicineId: expense.medicineId?._id || expense.medicineId || '',
    description: expense.description || '',
    receipt: null,
    removeReceipt: false,
    isRecurring: expense.isRecurring,
    recurringType: expense.recurringType || 'none',
    recurringEndDate: expense.recurringEndDate ? expense.recurringEndDate.split('T')[0] : '',
  });

  const [medicines, setMedicines] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const categories = ['Medicine', 'Medical Supplies', 'Equipment', 'Repairs', 'Other'];
  const recurringTypes = [
    { value: 'none', label: 'None' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  useEffect(() => {
    if (formData.category === 'Medicine') {
      const fetchMedicines = async () => {
        setLoadingMedicines(true);
        try {
          const response = await medicineService.getAllMedicines({ limit: 1000 });
          setMedicines(response.data || []);
        } catch (error) {
          console.error('Failed to fetch medicines:', error);
        } finally {
          setLoadingMedicines(false);
        }
      };
      
      if (medicines.length === 0) {
        fetchMedicines();
      }
    }
  }, [formData.category]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.unitCost || parseFloat(formData.unitCost) <= 0) {
      newErrors.unitCost = 'Unit cost must be greater than 0';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.vendor.trim()) {
      newErrors.vendor = 'Vendor name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    } else if (formData.category === 'Medicine' && !formData.medicineId) {
      newErrors.medicineId = 'Please select a medicine';
    }
    if (formData.isRecurring && formData.recurringType === 'none') {
      newErrors.recurringType = 'Please select a recurring type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files?.[0] || null,
        removeReceipt: false, // Reset remove flag if new file selected
      }));
      if (files?.[0]) {
        setErrors(prev => ({ ...prev, receipt: '' }));
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'quantity' || name === 'unitCost') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(expense._id, {
        quantity: parseFloat(formData.quantity),
        unitCost: parseFloat(formData.unitCost),
        date: formData.date,
        vendor: formData.vendor.trim(),
        category: formData.category,
        medicineId: formData.category === 'Medicine' ? formData.medicineId : '',
        description: formData.description.trim() || undefined,
        receipt: formData.receipt,
        removeReceipt: formData.removeReceipt,
        isRecurring: formData.isRecurring,
        recurringType: formData.recurringType,
        recurringEndDate: formData.recurringEndDate || undefined,
      });
      onClose();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Edit Expense</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Alert */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name *
              </label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleInputChange}
                placeholder="Enter vendor name..."
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.vendor && <p className="text-red-500 text-sm mt-1">{errors.vendor}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Select Medicine (Conditionally Rendered) */}
            {formData.category === 'Medicine' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Medicine *
                </label>
                <select
                  name="medicineId"
                  value={formData.medicineId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={loadingMedicines}
                >
                  <option value="">{loadingMedicines ? 'Loading medicines...' : 'Select a medicine...'}</option>
                  {medicines.map(med => (
                    <option key={med._id} value={med._id}>
                      {med.name} {med.manufacturer ? `(${med.manufacturer})` : ''} - Stock: {med.quantity}
                    </option>
                  ))}
                </select>
                {errors.medicineId && <p className="text-red-500 text-sm mt-1">{errors.medicineId}</p>}
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="0"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
            </div>

            {/* Unit Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Cost ($) *
              </label>
              <input
                type="number"
                name="unitCost"
                value={formData.unitCost}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.unitCost && <p className="text-red-500 text-sm mt-1">{errors.unitCost}</p>}
            </div>

            {/* Total Cost (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Cost ($)
              </label>
              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold">
                {(parseFloat(formData.quantity || 0) * parseFloat(formData.unitCost || 0)).toFixed(2)}
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add any additional details..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Receipt Management */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt
              </label>

              {/* Current Receipt */}
              {expense.receiptUrl && !formData.removeReceipt && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
                  <a
                    href={expense.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    View Current Receipt
                  </a>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, removeReceipt: true }))}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* File Upload */}
              {formData.removeReceipt || !expense.receiptUrl ? (
                <div>
                  <div className="flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 transition">
                    <label className="cursor-pointer w-full">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">
                          {formData.receipt ? (
                            <span className="text-green-600 font-medium">✓ {formData.receipt.name}</span>
                          ) : (
                            <>
                              <span className="font-medium">Click to upload</span> or drag and drop
                              <br />
                              <span className="text-xs text-gray-500">
                                JPG, PNG, GIF, WebP, or PDF (Max 5MB)
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <input
                        type="file"
                        name="receipt"
                        onChange={handleInputChange}
                        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                        className="hidden"
                      />
                    </label>
                  </div>
                  {errors.receipt && <p className="text-red-500 text-sm mt-1">{errors.receipt}</p>}
                </div>
              ) : null}

              {/* Cancel Receipt Removal */}
              {formData.removeReceipt && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, removeReceipt: false }))}
                  className="text-sm text-primary-600 hover:underline mt-2"
                >
                  Keep Current Receipt
                </button>
              )}
            </div>

            {/* Recurring Expense */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">This is a recurring expense</span>
              </label>
            </div>

            {/* Recurring Type and End Date */}
            {formData.isRecurring && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recurring Type *
                  </label>
                  <select
                    name="recurringType"
                    value={formData.recurringType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {recurringTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {errors.recurringType && (
                    <p className="text-red-500 text-sm mt-1">{errors.recurringType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="recurringEndDate"
                    value={formData.recurringEndDate}
                    onChange={handleInputChange}
                    min={formData.date}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 btn-primary rounded-lg font-medium disabled:opacity-50 transition"
            >
              {loading ? 'Updating...' : 'Update Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
