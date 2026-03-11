const { body, validationResult } = require('express-validator');

const expenseValidation = [
  body('quantity')
    .trim()
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('unitCost')
    .notEmpty()
    .withMessage('Unit cost is required')
    .isFloat({ min: 0 })
    .withMessage('Unit cost must be a non-negative number'),
  body('date')
    .notEmpty()
    .withMessage('Expense date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('vendor')
    .trim()
    .notEmpty()
    .withMessage('Vendor name is required')
    .isLength({ max: 200 })
    .withMessage('Vendor name cannot exceed 200 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Medicine', 'Medical Supplies', 'Equipment', 'Repairs', 'Other'])
    .withMessage('Invalid category'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('medicineId')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid medicine ID'),
  body('isRecurring')
    .optional({ checkFalsy: true })
    .isBoolean()
    .withMessage('isRecurring must be a boolean'),
  body('recurringType')
    .optional({ checkFalsy: true })
    .isIn(['none', 'weekly', 'monthly', 'yearly'])
    .withMessage('Invalid recurring type'),
];

const budgetValidation = [
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Medicine', 'Medical Supplies', 'Equipment', 'Repairs', 'Other', 'overall'])
    .withMessage('Invalid category'),
  body('monthYear')
    .trim()
    .notEmpty()
    .withMessage('Month-year is required')
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Month-year must be in format YYYY-MM'),
  body('budgetAmount')
    .notEmpty()
    .withMessage('Budget amount is required')
    .isFloat({ min: 0 })
    .withMessage('Budget amount must be a non-negative number'),
  body('alertThreshold')
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 100 })
    .withMessage('Alert threshold must be between 0 and 100'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: firstError.msg,
    });
  }
  next();
};

module.exports = {
  expenseValidation,
  budgetValidation,
  validate,
};
