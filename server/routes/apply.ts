import express from 'express';
import { logJobApplication, generateApplicationMaterials } from '../controllers/applyController';
import { protect } from '../middleware/auth'; // Import the protect middleware

const router = express.Router();

// Protect all apply routes
router.use(protect);

// Route to log a job application attempt (called by extension after attempt)
router.post('/log', logJobApplication);

// Route to generate application materials using AI (called by extension before applying)
router.post('/generate', generateApplicationMaterials);


export default router;
