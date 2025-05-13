import { Request, Response } from 'express';
import { User } from '@supabase/supabase-js';
import UserProfile from '../models/UserProfile'; // Import UserProfile model

// Extend the Request type to include the user property added by the protect middleware
interface ProtectedRequest extends Request {
  user?: User; // Supabase user object
}

// @desc    Get user profile (fetched by protect middleware and attached to req.user)
// @route   GET /api/auth/profile
// @access  Private (Authenticated users)
// NOTE: The actual profile data is now fetched by the protect middleware
// and attached to req.user. This endpoint can simply return that.
export const getUserProfile = async (req: ProtectedRequest, res: Response) => {
  const supabaseUser = req.user; // User object attached by 'protect' middleware

  if (!supabaseUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // The protect middleware already fetches the MongoDB profile and attaches it
  // to user_metadata.profile. We can return that.
  // Alternatively, you could fetch it again here if needed, but it's redundant.
  const userProfile = supabaseUser.user_metadata?.profile;

  if (!userProfile) {
       // This case should ideally not happen if protect middleware works correctly
       // and creates a profile on first login.
       console.error(`Profile not found for user ID: ${supabaseUser.id}`);
       return res.status(404).json({ message: 'User profile not found.' });
  }

  // Return the profile data
  res.json(userProfile);
};


// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private (Authenticated users)
export const updateUserProfile = async (req: ProtectedRequest, res: Response) => {
  const supabaseUser = req.user; // User object attached by 'protect' middleware
  const { name } = req.body; // Fields allowed to be updated

  if (!supabaseUser) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    // Find the user profile in MongoDB using the Supabase user ID
    const userProfile = await UserProfile.findOne({ userId: supabaseUser.id });

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    // Update allowed fields
    if (name !== undefined) { // Check if name is provided in the request body
      userProfile.name = name;
    }

    // Save the updated profile
    await userProfile.save();

    // Return the updated profile
    res.json(userProfile);

  } catch (error: any) {
    console.error('Error updating user profile:', error.message);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};
