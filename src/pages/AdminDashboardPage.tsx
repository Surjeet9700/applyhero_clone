import React, { useEffect, useState } from 'react';
import { api } from '../services/api'; // Import the API service
import { useAuth } from '../contexts/AuthContext'; // Import auth context to check if user is admin
import { Navigate } from 'react-router-dom'; // For redirection

// Define types for the data we expect from the backend
interface UserProfile {
  _id: string;
  userId: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  createdAt: string; // Dates are strings before parsing
}

interface JobApplication {
  _id: string;
  userId: string; // This will be the populated UserProfile object from backend
  userEmail: string; // Added for easier display
  jobTitle: string;
  companyName: string;
  status: string;
  applicationDetails?: string;
  dateApplied: string; // Dates are strings before parsing
  createdAt: string;
  updatedAt: string;
}

const AdminDashboardPage: React.FC = () => {
  const { user, loading } = useAuth(); // Get user and loading state from auth context
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if the authenticated user is an admin
  const isAdmin = user?.user_metadata?.isAdmin || false; // Assuming isAdmin is stored in user_metadata or profile

  useEffect(() => {
    // Only fetch data if user is loaded and is an admin
    if (!loading && isAdmin) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          setError(null);

          // Fetch all users
          const usersData = await api.admin.getAllUsers();
          setUsers(usersData);

          // Fetch all applications
          const applicationsData = await api.admin.getAllApplications();
          setApplications(applicationsData);

        } catch (err: any) {
          console.error('Error fetching admin data:', err);
          setError(err.message || 'Failed to fetch admin data.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    } else if (!loading && !isAdmin) {
        // If user is loaded but not admin, set loading to false and error
        setIsLoading(false);
        setError('You do not have administrative privileges.');
    }
  }, [user, loading, isAdmin]); // Re-run effect if user, loading, or isAdmin status changes

  // Redirect if not loading and not an admin
  if (!loading && !isAdmin && !error) {
      // Redirect to home or a forbidden page if not admin
      return <Navigate to="/" replace />;
  }

  if (loading || isLoading) {
    return <div>Loading Admin Dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Users Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">All Users ({users.length})</h2>
          <div className="bg-white shadow rounded-lg p-4">
            <ul className="divide-y divide-gray-200">
              {users.map(user => (
                <li key={user._id} className="py-3">
                  <p className="font-medium">{user.email} {user.isAdmin && <span className="text-blue-600">(Admin)</span>}</p>
                  <p className="text-sm text-gray-500">User ID: {user.userId}</p>
                  <p className="text-sm text-gray-500">Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Applications Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">All Applications ({applications.length})</h2>
           <div className="bg-white shadow rounded-lg p-4">
            <ul className="divide-y divide-gray-200">
              {applications.map(app => (
                <li key={app._id} className="py-3">
                  <p className="font-medium">{app.jobTitle} at {app.companyName}</p>
                  <p className="text-sm text-gray-700">Status: <span className={`font-semibold ${app.status === 'Applied' ? 'text-green-600' : 'text-red-600'}`}>{app.status}</span></p>
                   <p className="text-sm text-gray-500">User: {app.userEmail}</p>
                  <p className="text-sm text-gray-500">Applied: {new Date(app.dateApplied).toLocaleDateString()}</p>
                   {app.applicationDetails && <p className="text-xs text-gray-500 mt-1">Details: {app.applicationDetails}</p>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
