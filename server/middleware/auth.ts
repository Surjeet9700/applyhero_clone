import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Supabase URL or Service Role Key is missing for backend auth middleware.');
  // Depending on your needs, you might want to exit the process here
  // process.exit(1);
}

// Create a Supabase client instance for the backend using the service role key
// This client has admin privileges and can verify JWTs.
const supabaseAdmin = createClient(supabaseUrl as string, supabaseServiceRoleKey as string, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Middleware to protect routes
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token is found
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token using Supabase admin client
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.error('JWT verification failed:', error?.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }

    // Attach the Supabase user object to the request
    // You can access this user object in your controllers
    (req as any).user = user;

    next(); // Proceed to the next middleware or route handler

  } catch (error: any) {
    console.error('Error verifying token:', error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
