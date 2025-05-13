import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' }); // Adjust path if this file moves

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
// const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // For admin operations

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined in .env file');
}

// Client for typical browser/user operations (usually used in frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend operations that require elevated privileges
// IMPORTANT: Only use the service role key on the server-side. Never expose it in the client.
// export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey!, {
//   auth: {
//     autoRefreshToken: false,
//     persistSession: false
//   }
// });

// For now, the backend primarily uses the anon key client, assuming RLS is set up.
// If specific admin tasks are needed (like creating users directly bypassing RLS for admin panel),
// then supabaseAdmin would be used.
