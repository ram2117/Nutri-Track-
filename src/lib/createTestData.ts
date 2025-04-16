
import { supabase } from '@/integrations/supabase/client';

export async function createTestReminders(userId: string) {
  try {
    await supabase.from('reminders').insert([
      {
        user_id: userId,
        title: 'Take vitamins',
        time: '08:00',
        type: 'medication'
      },
      {
        user_id: userId,
        title: 'Drink water',
        time: '10:00',
        type: 'hydration'
      },
      {
        user_id: userId,
        title: 'Afternoon walk',
        time: '15:00',
        type: 'exercise'
      }
    ]);

    return { success: true };
  } catch (error) {
    console.error('Error creating test reminders:', error);
    return { success: false, error };
  }
}
