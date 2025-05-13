import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Import useAuth
import LoginPage from './pages/LoginPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';
import PricingPage from './pages/PricingPage'; // Import PricingPage
import './index.css'; // Ensure Tailwind CSS is imported

// Simple Navigation component
const Navigation: React.FC = () => {
  const { user, loading, signOut } = useAuth(); // Use useAuth hook

  // Check if the authenticated user is an admin
  const isAdmin = user?.user_metadata?.isAdmin || false; // Assuming isAdmin is stored in user_metadata or profile

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">ApplyHeroClone</Link>
        <div>
          {loading ? (
            <span>Loading...</span>
          ) : user ? (
            <>
              <Link to="/dashboard" className="mr-4 hover:text-gray-300">Dashboard</Link>
              <Link to="/profile" className="mr-4 hover:text-gray-300">Profile</Link>
              <Link to="/pricing" className="mr-4 hover:text-gray-300">Pricing</Link> {/* Add Pricing link */}
              {isAdmin && ( // Conditionally render Admin link
                 <Link to="/admin" className="mr-4 hover:text-gray-300 text-blue-300 font-semibold">Admin</Link>
              )}
              <button onClick={signOut} className="hover:text-gray-300">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/pricing" className="mr-4 hover:text-gray-300">Pricing</Link> {/* Add Pricing link */}
              <Link to="/login" className="hover:text-gray-300">Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// Basic PrivateRoute component (you might need a more robust one)
// This is a simple example, a real one would handle redirection properly
const PrivateRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return user ? <>{element}</> : <Navigate to="/login" replace />;
};

// Basic AdminRoute component
const AdminRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { user, loading } = useAuth();

  // Check if the authenticated user is an admin
  const isAdmin = user?.user_metadata?.isAdmin || false; // Assuming isAdmin is stored in user_metadata or profile

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  // If user is logged in AND is admin, render the element, otherwise redirect
  return user && isAdmin ? <>{element}</> : <Navigate to="/" replace />; // Redirect non-admins
};


function App() {
  return (
    <Router>
      <AuthProvider> {/* Wrap the app with AuthProvider */}
        <Navigation /> {/* Add navigation */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pricing" element={<PricingPage />} /> {/* Add PricingPage route */}
          {/* Protect routes that require authentication */}
          <Route path="/dashboard" element={<PrivateRoute element={<UserDashboardPage />} />} />
          <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
           {/* Protect admin routes */}
          <Route path="/admin" element={<AdminRoute element={<AdminDashboardPage />} />} />
          {/* Add a root route or landing page */}
          <Route path="/" element={
             <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold">Welcome to ApplyHeroClone</h1>
                <p className="mt-4">Your AI-powered job application assistant.</p>
                {/* Add more content or redirect based on auth status */}
             </div>
          } />
          {/* Add a 404 page */}
          <Route path="*" element={
             <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
             </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
