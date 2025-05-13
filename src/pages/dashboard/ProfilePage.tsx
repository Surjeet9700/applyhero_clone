import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils'; // Assuming you have a utils file with getInitials

const ProfilePage: React.FC = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-[30vh]">Loading profile...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-[30vh]">Please log in to view your profile.</div>;
  }

  // Use userProfile from backend if available, fallback to Supabase user data
  const profileData = userProfile || user;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profileData?.avatar_url} alt={profileData?.full_name || profileData?.email} />
              <AvatarFallback className="text-xl">{getInitials(profileData?.full_name || profileData?.email)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{profileData?.full_name || 'N/A'}</h3>
              <p className="text-muted-foreground">{profileData?.email}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <h4 className="text-lg font-semibold">Details</h4>
            <p><strong>User ID:</strong> {profileData?.id}</p>
            {profileData?.bio && <p><strong>Bio:</strong> {profileData.bio}</p>}
            {profileData?.created_at && <p><strong>Member Since:</strong> {new Date(profileData.created_at).toLocaleDateString()}</p>}
            {/* Add more profile fields here */}
          </div>

          {/* Add sections for editing profile, linked accounts, etc. */}
          {/* Example:
          <div className="grid gap-2">
             <h4 className="text-lg font-semibold">Edit Profile</h4>
             <p>TODO: Add form for editing profile details</p>
          </div>
          */}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
