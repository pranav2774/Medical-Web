const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  updateSettings,
  changePassword,
  verifyEmail,
  resendVerification,
  deleteAccount,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter, otpLimiter, resendVerificationLimiter } = require('../middleware/rateLimitAuth');
const { registerValidation, loginValidation, validate } = require('../middleware/validateAuth');

const router = express.Router();

// Rate limit login and register to prevent brute force
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
// OTP endpoint gets its own strict limiter (5 attempts / 15 min)
router.post('/verify-email', otpLimiter, verifyEmail);
router.post('/resend-verification', resendVerificationLimiter, resendVerification);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/profile', protect, updateProfile);
router.put('/settings', protect, updateSettings);
router.put('/change-password', protect, changePassword);
// DPDP Act 2023 — right to erasure
router.delete('/account', protect, deleteAccount);

module.exports = router;
