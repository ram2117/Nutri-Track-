
import { createClient } from '@supabase/supabase-js';

// Use the environment variables for the Supabase URL and anon key
const supabaseUrl = 'https://xzbjbmnikxtaclsjhfkt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6YmpibW5pa3h0YWNsc2poZmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MjU5NDIsImV4cCI6MjA1OTEwMTk0Mn0.OXxv-LFHdihHhlnRDxKZ_z0YhMYMuUngZG_y5zaCsl4';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserSession = {
  user: {
    id: string;
    email?: string;
  } | null;
  session: any | null;
};

// Helper function to check if the user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Get current user data
export const getCurrentUser = async (): Promise<UserSession> => {
  const { data } = await supabase.auth.getSession();
  return { 
    user: data.session?.user || null, 
    session: data.session 
  };
};
