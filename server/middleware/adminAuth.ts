import { Request, Response, NextFunction } from 'express';
import UserProfile from '../models/UserProfile'; // Import the UserProfile model
import { User } from '@supabase/supabase-js'; // Import Supabase User type

// Extend the Request type to include the user property added by the protect middleware
interface ProtectedRequest extends Request {
  user?: User; // Supabase user object
}

// Middleware to check if the authenticated user is an admin
export const adminProtect = async (req: ProtectedRequest, res: Response, next: NextFunction) => {
  const supabaseUser = req.user; // User object should be attached by the 'protect' middleware

  if (!supabaseUser) {
    // This middleware should ideally be used after 'protect' middleware
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    // Find the user profile in MongoDB using the Supabase user ID
    const userProfile = await UserProfile.findOne({ userId: supabaseUser.id });

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Check if the user is an admin
    if (userProfile.isAdmin) {
      // User is an admin, proceed to the next middleware/route handler
      next();
    } else {
      // User is not an admin
      res.status(403).json({ message: 'Access denied. Admins only.' });
    }

  } catch (error: any) {
    console.error('Error in adminProtect middleware:', error.message);
    res.status(500).json({ message: 'Server error during authorization check' });
  }
};
