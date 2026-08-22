const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  sendOTP, registerUser, loginUser,
  forgotPassword, resetPassword,
  googleAuth, githubCallback,
  getProfile, updateProfile, toggleFavorite,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.post('/send-otp', [body('email').isEmail()], sendOTP);
router.post('/register', registerUser);
router.post('/login', [body('email').isEmail(), body('password').notEmpty()], loginUser);
router.post('/forgot-password', [body('email').isEmail()], forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleAuth);
router.get('/github/callback', githubCallback);

// Protected
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/favorites/:uniId', protect, toggleFavorite);

module.exports = router;
