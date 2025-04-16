
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from 'lucide-react';

const ProtectedRoute: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const authed = !!data.session;
      setIsAuthed(authed);

      if (authed) {
        // Check if user has a profile
        const { data: profileData } = await supabase
          .rpc('has_profile', { user_id: data.session?.user.id });
        setHasProfile(profileData);
      }

      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-food-green" />
      </div>
    );
  }

  if (!isAuthed) {
    // Redirect to the login page but save the current location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but no profile, redirect to profile setup
  if (!hasProfile) {
    return <Navigate to="/profile-setup" replace />;
  }

  // If authenticated and has profile, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
