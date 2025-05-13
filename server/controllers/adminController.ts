import { Request, Response } from 'express';
import UserProfile from '../models/UserProfile'; // Import UserProfile model
import JobApplication from '../models/JobApplication'; // Import JobApplication model

// @desc    Get all user profiles
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Find all user profiles
    const users = await UserProfile.find().select('-__v -updatedAt'); // Exclude Mongoose version key and updatedAt

    res.json(users);

  } catch (error: any) {
    console.error('Error fetching all users:', error.message);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// @desc    Get all job applications
// @route   GET /api/admin/applications
// @access  Private (Admin only)
export const getAllApplications = async (req: Request, res: Response) => {
  try {
    // Find all job applications and populate user email for context
    const applications = await JobApplication.find()
      .populate('userId', 'email') // Populate the userId field with the user's email from UserProfile
      .select('-__v'); // Exclude Mongoose version key

    // Map the result to include user email directly
    const formattedApplications = applications.map(app => ({
      _id: app._id,
      userId: app.userId, // This will be the populated UserProfile object
      jobTitle: app.jobTitle,
      companyName: app.companyName,
      status: app.status,
      applicationDetails: app.applicationDetails,
      dateApplied: app.dateApplied,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      userEmail: (app.userId as any)?.email || 'N/A', // Access the populated email
    }));


    res.json(formattedApplications);

  } catch (error: any) {
    console.error('Error fetching all applications:', error.message);
    res.status(500).json({ message: 'Server error fetching applications' });
  }
};

// Add other admin controllers here (e.g., delete user, update application status)
