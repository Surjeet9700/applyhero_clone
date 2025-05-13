import { Request, Response } from 'express';
import { User } from '@supabase/supabase-js';
import JobApplication from '../models/JobApplication'; // Import the updated model
import { IJobApplication } from '../models/JobApplication'; // Import the interface

// Extend the Request type to include the user property added by the protect middleware
interface ProtectedRequest extends Request {
  user?: User; // Supabase user object
}

// @desc    Log a new job application (primarily called by the Chrome Extension)
// @route   POST /api/jobs/apply
// @access  Private (Authenticated users)
export const logJobApplication = async (req: ProtectedRequest, res: Response) => {
  const supabaseUser = req.user; // User object attached by 'protect' middleware
  const {
    title,
    company,
    jobUrl, // New field
    success,
    details,
    coverLetterContent, // New field
    resumeUrlUsed, // New field
    notes // New field (optional, could be added later by user)
  } = req.body;

  if (!supabaseUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Basic validation
  if (!title || !company || success === undefined) {
    return res.status(400).json({ message: 'Please include title, company, and success status.' });
  }

  try {
    const newApplication: IJobApplication = new JobApplication({
      userId: supabaseUser.id,
      title,
      company,
      jobUrl, // Save new field
      applicationDate: new Date(), // Set application date to now
      status: success ? 'Applied' : 'Other', // Default status based on success
      success,
      details,
      coverLetterContent, // Save new field
      resumeUrlUsed, // Save new field
      notes, // Save new field
    });

    await newApplication.save();

    res.status(201).json({ message: 'Job application logged successfully', application: newApplication });

  } catch (error: any) {
    console.error('Error logging job application:', error.message);
    res.status(500).json({ message: 'Server error logging application.' });
  }
};

// @desc    Get all job applications for the logged-in user
// @route   GET /api/jobs/applied
// @access  Private (Authenticated users)
export const getAppliedJobs = async (req: ProtectedRequest, res: Response) => {
  const supabaseUser = req.user; // User object attached by 'protect' middleware

  if (!supabaseUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    // Find all applications for the user, sorted by application date descending
    const applications = await JobApplication.find({ userId: supabaseUser.id })
      .sort({ applicationDate: -1 }); // Sort by most recent first

    // Return the applications array
    res.json(applications);

  } catch (error: any) {
    console.error('Error fetching applied jobs:', error.message);
    res.status(500).json({ message: 'Server error fetching applications.' });
  }
};

// @desc    Update status or notes for a specific job application
// @route   PUT /api/jobs/:id
// @access  Private (Authenticated users)
export const updateJobApplication = async (req: ProtectedRequest, res: Response) => {
  const supabaseUser = req.user;
  const applicationId = req.params.id; // Get application ID from URL params
  const { status, notes } = req.body; // Fields allowed to be updated by user

  if (!supabaseUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    // Find the application by ID and ensure it belongs to the logged-in user
    const application = await JobApplication.findOne({ _id: applicationId, userId: supabaseUser.id });

    if (!application) {
      return res.status(404).json({ message: 'Job application not found or does not belong to user.' });
    }

    // Update allowed fields if provided
    if (status !== undefined) {
      // Ensure the provided status is one of the allowed enum values
      const allowedStatuses = ['Applied', 'Interviewing', 'Rejected', 'Offer', 'Other'];
      if (allowedStatuses.includes(status)) {
         application.status = status;
      } else {
         return res.status(400).json({ message: `Invalid status provided. Allowed statuses are: ${allowedStatuses.join(', ')}` });
      }
    }

    if (notes !== undefined) {
      application.notes = notes;
    }

    // Save the updated application
    await application.save();

    res.json({ message: 'Job application updated successfully', application });

  } catch (error: any) {
    console.error('Error updating job application:', error.message);
    res.status(500).json({ message: 'Server error updating application.' });
  }
};

// @desc    Delete a job application
// @route   DELETE /api/jobs/:id
// @access  Private (Authenticated users)
export const deleteJobApplication = async (req: ProtectedRequest, res: Response) => {
  const supabaseUser = req.user;
  const applicationId = req.params.id;

  if (!supabaseUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    // Find and delete the application by ID and ensure it belongs to the logged-in user
    const result = await JobApplication.deleteOne({ _id: applicationId, userId: supabaseUser.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Job application not found or does not belong to user.' });
    }

    res.json({ message: 'Job application deleted successfully' });

  } catch (error: any) {
    console.error('Error deleting job application:', error.message);
    res.status(500).json({ message: 'Server error deleting application.' });
  }
};
