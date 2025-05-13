import express from 'express';
import {
  logJobApplication,
  getAppliedJobs,
  updateJobApplication, // Import new controller functions
  deleteJobApplication, // Import new controller functions
} from '../controllers/jobController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply the protect middleware to all job routes
router.use(protect);

// @route   POST /api/jobs/apply
// @desc    Log a new job application (primarily from extension)
// @access  Private
router.post('/apply', logJobApplication);

// @route   GET /api/jobs/applied
// @desc    Get all job applications for the logged-in user
// @access  Private
router.get('/applied', getAppliedJobs);

// @route   PUT /api/jobs/:id
// @desc    Update status or notes for a specific job application
// @access  Private
router.put('/:id', updateJobApplication); // Add PUT route

// @route   DELETE /api/jobs/:id
// @desc    Delete a job application
// @access  Private
router.delete('/:id', deleteJobApplication); // Add DELETE route


export default router;
