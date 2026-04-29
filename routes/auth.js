const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user (requires authentication)
router.get('/me', authMiddleware(true), authController.me);

// Request password reset
router.post('/request-password-reset', authController.requestPasswordReset);

// Reset password with token
router.post('/reset-password', authController.resetPassword);

module.exports = router;
