import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL or Anon Key is missing. Please check your .env file. Some features might not work."
  );
  // Fallback to dummy client or throw error, depending on desired behavior if not configured
  // For now, we'll let it proceed, but auth will fail.
}

export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string, {
  auth: {
    // Supabase specific options
    // autoRefreshToken: true, // default
    // persistSession: true, // default
    // detectSessionInUrl: true // default for OAuth
  }
});
