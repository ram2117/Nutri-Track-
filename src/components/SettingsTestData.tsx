
import React from 'react';
import { Button } from './ui/button';
import { createTestReminders } from '@/lib/createTestData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { supabase } from '@/integrations/supabase/client';

export function SettingsTestData() {
  const { user } = useAuth();

  

  const handleCreateTestReminders = async () => {
    if (!user) {
      toast.error('You must be logged in to create test data');
      return;
    }

    try {
      // Get the token first
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) {
        throw new Error('No active session found');
      }
      
      // Use a direct fetch call to the REST API
      const response = await fetch(
        `https://xzbjbmnikxtaclsjhfkt.supabase.co/rest/v1/reminders`,
        {
          method: 'POST',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6YmpibW5pa3h0YWNsc2poZmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MjU5NDIsImV4cCI6MjA1OTEwMTk0Mn0.OXxv-LFHdihHhlnRDxKZ_z0YhMYMuUngZG_y5zaCsl4',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify([
            {
              user_id: user.id,
              title: 'Take vitamins',
              time: '08:00',
              type: 'medication'
            },
            {
              user_id: user.id,
              title: 'Drink water',
              time: '10:00',
              type: 'hydration'
            },
            {
              user_id: user.id,
              title: 'Afternoon walk',
              time: '15:00',
              type: 'exercise'
            }
          ])
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to create test reminders');
      }
      
      toast.success('Test reminders created successfully');
    } catch (error) {
      console.error('Error creating test reminders:', error);
      toast.error('An error occurred while creating test reminders');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Data</CardTitle>
        <CardDescription>Generate test data for your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">
            Use these buttons to create sample data for testing purposes.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCreateTestReminders} variant="outline">
              Create Test Reminders
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
