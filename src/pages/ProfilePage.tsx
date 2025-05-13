import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook
import { api } from '../services/api'; // Import API service
import { Input } from '@/components/ui/input'; // Shadcn Input
import { Label } from '@/components/ui/label'; // Shadcn Label
import { Button } from '@/components/ui/button'; // Shadcn Button

const ProfilePage: React.FC = () => {
  const { user, loading: authLoading, refreshProfile } = useAuth(); // Get user, loading, and refreshProfile from context
  const [profileData, setProfileData] = useState<{ name?: string; email?: string; isAdmin?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);


  // Fetch profile data when user or authLoading changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || authLoading) {
        setLoading(authLoading); // Match loading state with auth loading initially
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // The profile data is already attached to the user object by the AuthContext's protect middleware
        // We can access it directly from user.user_metadata.profile
        const fetchedProfile = user.user_metadata?.profile;

        if (fetchedProfile) {
            setProfileData(fetchedProfile);
            setEditedName(fetchedProfile.name || ''); // Initialize editedName with current name
        } else {
            // This case should ideally not happen if the backend creates a profile on first login
            setError('User profile not found in user data.');
            console.error('User profile not found in user_metadata for user:', user);
        }

      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading]); // Re-run effect if user or authLoading changes

  const handleEditClick = () => {
    setIsEditing(true);
    setSaveSuccess(false); // Reset success message on edit
    setSaveError(null); // Reset error message on edit
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset edited name to the current profile name
    setEditedName(profileData?.name || '');
    setSaveError(null); // Clear save error
  };

  const handleSaveClick = async () => {
    if (!user || !profileData) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Call the backend API to update the profile
      const updatedProfile = await api.auth.updateProfile({ name: editedName });

      // Update local state with the new profile data
      setProfileData(updatedProfile);
      setIsEditing(false);
      setSaveSuccess(true); // Show success message

      // Optionally, refresh the user object in AuthContext if needed
      // This depends on how deeply integrated the profile data is with the user object
      // If profile is stored in user_metadata, you might need to re-fetch the user
      // Supabase's onAuthStateChange might handle this automatically if the token updates,
      // but explicitly calling refreshProfile might be necessary depending on implementation.
      // refreshProfile(); // Assuming AuthContext has a method to refresh user/profile

    } catch (err: any) {
      console.error('Error saving profile:', err);
      setSaveError(err.message || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };


  if (authLoading || loading) {
    return <div className="container mx-auto py-8 text-center">Loading profile...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!user || !profileData) {
       // This should ideally not be reached if PrivateRoute works correctly
       return <div className="container mx-auto py-8 text-center">Please log in to view your profile.</div>;
  }


  return (
    <div className="container mx-auto py-8 max-w-md">
      <h1 className="text-3xl font-bold text-center mb-8">User Profile</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {saveSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> Profile updated successfully.</span>
            </div>
        )}
         {saveError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {saveError}</span>
            </div>
        )}

        <div className="grid gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            {/* Email is typically not editable via this form, display it */}
            <Input id="email" type="email" value={profileData.email || ''} disabled className="cursor-not-allowed" />
          </div>

          <div>
            <Label htmlFor="name">Name</Label>
            {isEditing ? (
              <Input
                id="name"
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                disabled={isSaving}
              />
            ) : (
              <Input id="name" type="text" value={profileData.name || 'N/A'} disabled className="cursor-not-allowed" />
            )}
          </div>

          {/* Display isAdmin status (optional) */}
           <div>
            <Label htmlFor="role">Role</Label>
             <Input id="role" type="text" value={profileData.isAdmin ? 'Admin' : 'User'} disabled className="cursor-not-allowed" />
           </div>

          {isEditing ? (
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={handleCancelClick} disabled={isSaving}>Cancel</Button>
              <Button onClick={handleSaveClick} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <div className="flex justify-end mt-4">
              <Button onClick={handleEditClick}>Edit Profile</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
