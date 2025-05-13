import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import { api } from '@/services/api'; 

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<any>;
  register: (email: string, pass: string, fullName: string) => Promise<any>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<any>; // To fetch profile from our backend
  userProfile: Record<string, any> | null; // Profile from our backend
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // Placeholder for admin logic

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch profile from backend after getting Supabase user
        await fetchUserProfileData(session.user.id);
        // Check admin status (placeholder)
        // This would typically involve checking a custom claim in JWT or a 'roles' table
        // For example: setIsAdmin(session.user.app_metadata?.roles?.includes('admin'));
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Fetch profile from backend on auth state change (e.g., login)
          await fetchUserProfileData(session.user.id);
          // setIsAdmin(session.user.app_metadata?.roles?.includes('admin'));
        } else {
          setUserProfile(null); // Clear profile on logout
          setIsAdmin(false);
        }
        if (_event === 'INITIAL_SESSION') {
            setLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfileData = async (userId?: string) => {
    // We don't necessarily need userId here if the backend uses the JWT
    // to identify the user. The backend endpoint /api/auth/profile
    // is designed to fetch the profile for the authenticated user.
    if (!user && !userId) return null; // Need at least a user object or ID

    try {
      // The apiClient interceptor adds the Supabase JWT automatically
      const response = await apiClient.get('/auth/profile');
      setUserProfile(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile from backend:', error);
      setUserProfile(null); // Clear profile on error
      return null;
    }
  };


  const login = async (email: string, pass: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      setLoading(false);
      throw error;
    }
    if (data.user) {
      // Fetch profile after successful login
      await fetchUserProfileData(data.user.id);
    }
    setLoading(false);
    return data;
  };

  const register = async (email: string, pass: string, fullName: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName, // This goes into auth.users.raw_user_meta_data
        },
      },
    });
    // After Supabase sign-up, you might want to create a profile in your public 'profiles' table.
    // This can be done via a Supabase Function triggered on new user creation, or client-side.
    // For example, if client-side:
    if (data.user && !error) {
      // Example: Create a profile entry. Ensure RLS allows this.
      // Or, this logic could be in a Supabase Function.
      // For now, we'll assume the backend /api/auth/profile endpoint
      // will handle fetching/creating the profile entry in the backend DB (MongoDB).
      // We can trigger a profile fetch here, but the backend needs to handle creation on first fetch.
       await fetchUserProfileData(data.user.id); // Fetch profile after registration
    }

    setLoading(false);
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserProfile(null); // Clear profile on logout
    setIsAdmin(false);
    // Clear any custom JWT from localStorage if you were using one
    // localStorage.removeItem('your_custom_jwt_token');
    setLoading(false);
  };

  const value = {
    session,
    user,
    loading,
    isAdmin,
    login,
    register,
    logout,
    fetchUserProfile: fetchUserProfileData, // Expose fetch function
    userProfile,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
