const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  logout,
  updateProfile,
  updateSettings,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const authLimiter = require('../middleware/rateLimitAuth');
const { registerValidation, loginValidation, validate } = require('../middleware/validateAuth');

const router = express.Router();

// Rate limit login and register to prevent brute force
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/profile', protect, updateProfile);
router.put('/settings', protect, updateSettings);
router.put('/change-password', protect, changePassword);

module.exports = router;
