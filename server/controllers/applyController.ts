import { Request, Response } from 'express';
import JobApplication from '../models/JobApplication'; // Import the Mongoose model
import { User } from '@supabase/supabase-js'; // Import Supabase User type
import { generateApplicationMaterials as callGenerateAI } from './aiController'; // Import the AI generation function

// Extend the Request type to include the user property added by the protect middleware
interface ProtectedRequest extends Request {
  user?: User; // Supabase user object
}

// @desc    Log a new job application
// @route   POST /api/apply/log
// @access  Private (Protected by middleware)
export const logJobApplication = async (req: ProtectedRequest, res: Response) => {
  const supabaseUser = req.user;

  if (!supabaseUser) {
    return res.status(401).json({ message: 'User not authenticated via middleware' });
  }

  // Note: The extension sends { title, company, success, details }
  const { title, company, success, details } = req.body;

  // Basic validation
  if (!title || !company || typeof success !== 'boolean') {
    return res.status(400).json({ message: 'Job title, company, and success status are required.' });
  }

  try {
    // We don't have jobIdExternal from the extension log, so we'll omit it for now
    // or generate one if needed. Let's omit for now as it's not strictly required by the model.
    const newApplication = await JobApplication.create({
      userId: supabaseUser.id, // Link to the Supabase user ID
      jobTitle: title,
      companyName: company,
      status: success ? 'Applied' : 'Failed', // Status based on success flag
      applicationDetails: details || (success ? 'Application process completed.' : 'Application process failed.'),
      dateApplied: new Date(), // Add date applied
    });

    // We don't need to send the full application back to the extension, just a success status
    res.status(201).json({ message: 'Application logged successfully', success: true });

  } catch (error: any) {
    console.error('Error logging job application:', error.message);
    res.status(500).json({ message: 'Server error logging application', success: false });
  }
};


// @desc    Generate application materials using AI
// @route   POST /api/apply/generate
// @access  Private (Protected by middleware)
export const generateApplicationMaterials = async (req: ProtectedRequest, res: Response) => {
  const supabaseUser = req.user;

  if (!supabaseUser) {
    return res.status(401).json({ message: 'User not authenticated via middleware' });
  }

  const { title, company, description } = req.body;

  // Basic validation for job details
  if (!title || !company || !description) {
    return res.status(400).json({ message: 'Job title, company, and description are required for AI generation.' });
  }

  try {
    // Call the AI controller function
    const materials = await callGenerateAI({ title, company, description });

    // Return the generated materials to the extension
    res.status(200).json(materials);

  } catch (error: any) {
    console.error('Error in /api/apply/generate:', error.message);
    res.status(500).json({ message: error.message || 'Server error generating materials' });
  }
};
