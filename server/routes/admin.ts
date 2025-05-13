import express from 'express';
import { protect } from '../middleware/auth'; // Import the standard auth middleware
import { adminProtect } from '../middleware/adminAuth'; // Import the admin auth middleware
import { getAllUsers, getAllApplications } from '../controllers/adminController'; // Import admin controllers

const router = express.Router();

// All admin routes require both authentication and admin privileges
router.use(protect); // First, ensure the user is authenticated
router.use(adminProtect); // Then, ensure the authenticated user is an admin

// Route to get all user profiles
router.get('/users', getAllUsers);

// Route to get all job applications
router.get('/applications', getAllApplications);

// Add other admin routes here (e.g., /users/:id, /applications/:id)

export default router;
