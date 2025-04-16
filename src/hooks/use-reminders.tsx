
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Reminder {
  id: string;
  title: string;
  time: string;
  type: string;
  created_at: string;
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    // Fetch initial reminders
    fetchReminders();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReminders(prev => [payload.new as any, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setReminders(prev => 
              prev.map(reminder => 
                reminder.id === payload.new.id ? payload.new as any : reminder
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setReminders(prev => 
              prev.filter(reminder => reminder.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchReminders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get the session token first
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) {
        throw new Error('No active session found');
      }
      
      // Use raw REST call to bypass TypeScript limitations
      const response = await fetch(
        `https://xzbjbmnikxtaclsjhfkt.supabase.co/rest/v1/reminders?user_id=eq.${user.id}&order=created_at.desc`,
        {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6YmpibW5pa3h0YWNsc2poZmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MjU5NDIsImV4cCI6MjA1OTEwMTk0Mn0.OXxv-LFHdihHhlnRDxKZ_z0YhMYMuUngZG_y5zaCsl4',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch reminders');
      }
      
      const data = await response.json();
      setReminders(data as Reminder[]);
      
    } catch (error: any) {
      console.error('Error fetching reminders:', error.message);
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const addReminder = async (title: string, time: string, type: string) => {
    if (!user) return;
    
    try {
      // Get the session token first
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) {
        throw new Error('No active session found');
      }
      
      // Use raw REST call
      const response = await fetch(
        `https://xzbjbmnikxtaclsjhfkt.supabase.co/rest/v1/reminders`,
        {
          method: 'POST',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6YmpibW5pa3h0YWNsc2poZmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MjU5NDIsImV4cCI6MjA1OTEwMTk0Mn0.OXxv-LFHdihHhlnRDxKZ_z0YhMYMuUngZG_y5zaCsl4',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_id: user.id,
            title,
            time,
            type
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to add reminder');
      }
      
      const data = await response.json();
      
      // The data should be returned as an array with the newly created record
      if (Array.isArray(data) && data.length > 0) {
        const newReminder = data[0] as Reminder;
        
        // Update local state (not needed with realtime subscription, but just in case)
        setReminders(prev => [newReminder, ...prev]);
        
        toast.success('Reminder added successfully');
        return newReminder;
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error: any) {
      console.error('Error adding reminder:', error.message);
      toast.error('Failed to add reminder');
      return null;
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      // Get the session token first
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) {
        throw new Error('No active session found');
      }
      
      // Use raw REST call
      const response = await fetch(
        `https://xzbjbmnikxtaclsjhfkt.supabase.co/rest/v1/reminders?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6YmpibW5pa3h0YWNsc2poZmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MjU5NDIsImV4cCI6MjA1OTEwMTk0Mn0.OXxv-LFHdihHhlnRDxKZ_z0YhMYMuUngZG_y5zaCsl4',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete reminder');
      }
      
      // Update local state (not needed with realtime subscription, but just in case)
      setReminders(reminders.filter(reminder => reminder.id !== id));
      
      toast.success('Reminder removed');
    } catch (error: any) {
      console.error('Error deleting reminder:', error.message);
      toast.error('Failed to delete reminder');
    }
  };

  return {
    reminders,
    loading,
    addReminder,
    deleteReminder
  };
}
