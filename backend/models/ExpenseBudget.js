const mongoose = require('mongoose');

const expenseBudgetSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Please provide category'],
      enum: ['medicine-purchase', 'storage', 'utilities', 'labor', 'miscellaneous', 'overall'],
    },
    monthYear: {
      type: String, // Format: "2026-03" for March 2026
      required: [true, 'Please provide month-year'],
    },
    budgetAmount: {
      type: Number,
      required: [true, 'Please provide budget amount'],
      min: [0, 'Budget amount cannot be negative'],
    },
    currentSpending: {
      type: Number,
      default: 0,
      min: [0, 'Current spending cannot be negative'],
    },
    alertThreshold: {
      type: Number, // Percentage (e.g., 80 means alert at 80% of budget)
      default: 80,
      min: [0, 'Alert threshold cannot be less than 0'],
      max: [100, 'Alert threshold cannot exceed 100'],
    },
    alertTriggered: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide admin user ID'],
    },
  },
  { timestamps: true }
);

// Compound index for category and monthYear (ensure only one budget per category per month)
expenseBudgetSchema.index({ category: 1, monthYear: 1 }, { unique: true });
expenseBudgetSchema.index({ monthYear: 1 });
expenseBudgetSchema.index({ createdBy: 1 });

// Method to check if budget is exceeded
expenseBudgetSchema.methods.isExceeded = function () {
  return this.currentSpending > this.budgetAmount;
};

// Method to get percentage spent
expenseBudgetSchema.methods.getPercentageSpent = function () {
  if (this.budgetAmount === 0) return 0;
  return Math.round((this.currentSpending / this.budgetAmount) * 100);
};

// Method to check if alert should trigger
expenseBudgetSchema.methods.shouldTriggerAlert = function () {
  const percentageSpent = this.getPercentageSpent();
  return percentageSpent >= this.alertThreshold;
};

module.exports = mongoose.model('ExpenseBudget', expenseBudgetSchema);
