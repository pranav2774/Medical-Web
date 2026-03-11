const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: false, // Optional - not all expenses are medicine-related
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide quantity'],
      min: [0, 'Quantity cannot be negative'],
    },
    unitCost: {
      type: Number,
      required: [true, 'Please provide unit cost'],
      min: [0, 'Unit cost cannot be negative'],
    },
    totalCost: {
      type: Number,
      required: [true, 'Please provide total cost'],
      min: [0, 'Total cost cannot be negative'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide expense date'],
      default: Date.now,
    },
    vendor: {
      type: String,
      required: [true, 'Please provide vendor name'],
      trim: true,
      maxlength: [200, 'Vendor name cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      enum: ['medicine-purchase', 'storage', 'utilities', 'labor', 'miscellaneous'],
      default: 'medicine-purchase',
    },
    receiptUrl: {
      type: String,
      required: false, // Receipt is optional for now
      default: null,
    },
    receiptFileId: {
      type: String, // ImageKit file ID for deletion
      required: false,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // Option A: auto-approve
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringType: {
      type: String,
      enum: ['none', 'weekly', 'monthly', 'yearly'],
      default: 'none',
    },
    recurringEndDate: {
      type: Date,
      required: false,
      default: null,
    },
    parentRecurringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      required: false, // Links child recurring expenses to parent
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user ID'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ medicineId: 1 });
expenseSchema.index({ createdBy: 1 });

// Auto-calculate totalCost if quantity and unitCost change
expenseSchema.pre('save', function (next) {
  if (this.quantity && this.unitCost) {
    this.totalCost = this.quantity * this.unitCost;
  }
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
