const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide medicine name'],
      trim: true,
      maxlength: [150, 'Medicine name cannot exceed 150 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'other'],
    },
    description: {
      type: String,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide quantity in stock'],
      min: [0, 'Quantity cannot be negative'],
    },
    stockStatus: {
      type: Boolean,
      default: function () {
        return this.quantity > 0;
      },
    },
    unit: {
      type: String,
      enum: ['mg', 'ml', 'g', 'piece'],
      default: 'mg',
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: null,
    },
    illnessCategory: {
      type: String,
      trim: true,
      enum: ['headache', 'stomach-pain', 'fever', 'cough', 'cold', 'allergy', 'pain-relief', 'diabetes', 'hypertension', 'other', ''],
      default: '',
    },
  },
  { timestamps: true }
);

// Update stockStatus before saving
medicineSchema.pre('save', function (next) {
  this.stockStatus = this.quantity > 0;
  next();
});

module.exports = mongoose.model('Medicine', medicineSchema);
