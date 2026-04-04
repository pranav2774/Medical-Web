const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
require('dotenv').config();

const connectDB = require('./config/database');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Security Headers (Helmet with explicit CSP) ─────────────────────────────
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim()).filter(Boolean)
  : ['http://localhost:5173'];

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://ik.imagekit.io'],
        connectSrc: ["'self'", ...allowedOrigins],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // allow ImageKit images
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));

// ─── Body Parsers (tight limits to prevent DoS) ───────────────────────────────
// Large limit only for the prescription image upload (base64 in JSON body).
// All other routes get 1 mb.
app.use((req, res, next) => {
  if (req.path === '/api/orders' && req.method === 'POST') {
    express.json({ limit: '15mb' })(req, res, next);
  } else {
    express.json({ limit: '1mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// ─── NoSQL Injection Sanitization ────────────────────────────────────────────
// Strips $ and . operators from req.body, req.query, req.params
app.use(mongoSanitize());

// ─── HTTP Parameter Pollution Protection ─────────────────────────────────────
app.use(hpp());

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const medicineRoutes = require('./routes/medicines');
const userRoutes = require('./routes/users');
const publicMedicinesRoutes = require('./routes/publicMedicines');
const orderRoutes = require('./routes/orders');
const expenseRoutes = require('./routes/expenses');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/users', userRoutes);
app.use('/api/public/medicines', publicMedicinesRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error',
    // Never expose stack traces in production
    ...(process.env.NODE_ENV === 'development' && { error: err }),
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
