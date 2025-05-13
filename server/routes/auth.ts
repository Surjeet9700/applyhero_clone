import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/authController'; // Import updateUserProfile
import { protect } from '../middleware/auth'; // Import the protect middleware

const router = express.Router();

// Apply the protect middleware to all auth routes that require authentication
router.use(protect);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', getUserProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', updateUserProfile); // Add the PUT route for updating profile


export default router;
