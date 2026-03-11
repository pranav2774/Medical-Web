const multer = require('multer');
const path = require('path');

// Configure storage (keep in memory for direct upload to ImageKit)
const storage = multer.memoryStorage();

// File filter for receipts (images and PDFs only)
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];

  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (allowedMimes.includes(mimeType) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPG, PNG, GIF, WebP, and PDF files are allowed.'
      ),
      false
    );
  }
};

// Configure limits
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB max file size
};

// Create multer upload instance
const uploadReceipt = multer({
  storage,
  fileFilter,
  limits,
});

/**
 * Middleware to validate receipt file
 * Use this after multer to add custom validations
 */
const validateReceiptFile = (req, res, next) => {
  if (!req.file) {
    return next(); // No file provided is okay (receipt is optional)
  }

  // File already validated by multer, but additional checks can be added here
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: `File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`,
    });
  }

  next();
};

/**
 * Middleware to handle multer errors
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum limit of 5MB',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Only one file can be uploaded at a time',
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
    });
  }
  next();
};

module.exports = {
  uploadReceipt: uploadReceipt.single('receipt'),
  validateReceiptFile,
  handleUploadError,
};
