
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Droplet, Plus, Minus, Trash2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WaterEntry {
  id: string;
  amount: number;
  time: string;
  unit: string;
}

const WaterTracking = () => {
  const { user } = useAuth();
  const [dailyGoal, setDailyGoal] = useState(2500); // ml
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [newAmount, setNewAmount] = useState(250);
  const [selectedUnit, setSelectedUnit] = useState("ml");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user settings and water entries when component mounts
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user settings with proper typing
        const { data: settingsData } = await supabase
          .from('user_settings')
          .select('daily_water_goal')
          .eq('user_id', user.id)
          .maybeSingle() as any;

        if (settingsData) {
          setDailyGoal(settingsData.daily_water_goal);
        } else {
          // Create default settings if none exist
          await supabase
            .from('user_settings')
            .insert({ user_id: user.id, daily_water_goal: 2500 } as any);
        }

        // Fetch water entries for today with proper typing
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: entriesData, error } = await supabase
          .from('water_entries')
          .select('id, amount, unit, time')
          .eq('user_id', user.id)
          .gte('time', today.toISOString())
          .order('time', { ascending: false }) as any;

        if (error) {
          throw error;
        }

        if (entriesData) {
          const formattedEntries = entriesData.map(entry => ({
            id: entry.id,
            amount: entry.amount,
            unit: entry.unit,
            time: new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          }));
          setWaterEntries(formattedEntries);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load your water tracking data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const totalIntake = waterEntries.reduce((total, entry) => total + entry.amount, 0);
  const progress = Math.min((totalIntake / dailyGoal) * 100, 100);
  
  const handleAddWater = async () => {
    if (!user) {
      toast.error("Please log in to track water intake");
      return;
    }

    if (newAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      
      // Save to Supabase with proper typing
      const { data, error } = await supabase
        .from('water_entries')
        .insert({
          user_id: user.id,
          amount: newAmount,
          unit: selectedUnit,
          time: now.toISOString(),
        } as any)
        .select('id')
        .single() as any;

      if (error) throw error;

      if (data) {
        const newEntry: WaterEntry = {
          id: data.id,
          amount: newAmount,
          time: timeString,
          unit: selectedUnit
        };

        setWaterEntries([newEntry, ...waterEntries]);
        toast.success(`Added ${newAmount}${selectedUnit} of water`);
      }
    } catch (error) {
      console.error('Error adding water entry:', error);
      toast.error('Failed to save water entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveEntry = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('water_entries')
        .delete()
        .eq('id', id) as any;

      if (error) throw error;
      
      setWaterEntries(waterEntries.filter(entry => entry.id !== id));
      toast.success("Water entry removed");
    } catch (error) {
      console.error('Error removing water entry:', error);
      toast.error('Failed to remove water entry');
    }
  };

  const handleIncreaseAmount = () => {
    setNewAmount(prev => prev + 50);
  };

  const handleDecreaseAmount = () => {
    setNewAmount(prev => Math.max(50, prev - 50));
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      // First check if settings exist for this user
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle() as any;
      
      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('user_settings')
          .update({
            daily_water_goal: dailyGoal,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id) as any;
          
        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            daily_water_goal: dailyGoal,
            updated_at: new Date().toISOString()
          } as any);
          
        if (error) throw error;
      }
      
      toast.success(`Daily goal updated to ${dailyGoal}ml`);
    } catch (error) {
      console.error('Error updating water goal:', error);
      toast.error('Failed to update daily goal');
    }
  };
  
  const refreshData = () => {
    if (user) {
      setIsLoading(true);
      const fetchData = async () => {
        try {
          // Fetch water entries for today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const { data: entriesData, error } = await supabase
            .from('water_entries')
            .select('id, amount, unit, time')
            .eq('user_id', user.id)
            .gte('time', today.toISOString())
            .order('time', { ascending: false }) as any;

          if (error) throw error;

          if (entriesData) {
            const formattedEntries = entriesData.map(entry => ({
              id: entry.id,
              amount: entry.amount,
              unit: entry.unit,
              time: new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            }));
            setWaterEntries(formattedEntries);
          }
        } catch (error) {
          console.error('Error refreshing data:', error);
          toast.error('Failed to refresh water tracking data');
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  };

  return (
    <div className="container py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Droplet className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold">Water Tracking</h1>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={refreshData}
          disabled={isLoading}
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Water Intake</CardTitle>
              <CardDescription>Track your hydration throughout the day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{totalIntake}ml / {dailyGoal}ml</span>
                </div>
                <Progress value={progress} className="h-3" />
                <p className="text-center text-sm text-muted-foreground mt-1">
                  {progress < 100 
                    ? `${Math.round(dailyGoal - totalIntake)}ml remaining to reach your goal` 
                    : "You've reached your goal! Good job!"}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center border rounded-lg p-4">
                  <span className="text-xs text-muted-foreground">Today</span>
                  <span className="text-2xl font-bold text-primary">{totalIntake}ml</span>
                </div>
                <div className="flex flex-col items-center justify-center border rounded-lg p-4">
                  <span className="text-xs text-muted-foreground">Goal</span>
                  <span className="text-2xl font-bold">{dailyGoal}ml</span>
                </div>
                <div className="flex flex-col items-center justify-center border rounded-lg p-4">
                  <span className="text-xs text-muted-foreground">Entries</span>
                  <span className="text-2xl font-bold">{waterEntries.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Add Water</CardTitle>
              <CardDescription>Log your water intake</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="icon" onClick={handleDecreaseAmount}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-20 sm:w-24">
                    <Input
                      type="number"
                      min="1"
                      className="text-center"
                      value={newAmount}
                      onChange={(e) => setNewAmount(Number(e.target.value))}
                    />
                  </div>
                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger className="w-[60px] sm:w-[80px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="oz">oz</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={handleIncreaseAmount}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  onClick={handleAddWater} 
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  {isSaving ? "Adding..." : "Add Water"}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button variant="outline" onClick={() => setNewAmount(125)}>125ml</Button>
                <Button variant="outline" onClick={() => setNewAmount(250)}>250ml</Button>
                <Button variant="outline" onClick={() => setNewAmount(330)}>330ml</Button>
                <Button variant="outline" onClick={() => setNewAmount(500)}>500ml</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Set Daily Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateGoal}>
                <div className="space-y-3">
                  <Label htmlFor="daily-goal">Daily water goal (ml)</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="daily-goal"
                      type="number"
                      min="500"
                      value={dailyGoal}
                      onChange={(e) => setDailyGoal(Number(e.target.value))}
                      className="flex-1"
                    />
                    <Button type="submit" className="w-full sm:w-auto">Update</Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setDailyGoal(1500)}>1500ml</Button>
                    <Button type="button" variant="outline" onClick={() => setDailyGoal(2000)}>2000ml</Button>
                    <Button type="button" variant="outline" onClick={() => setDailyGoal(2500)}>2500ml</Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <CardTitle>Water Log</CardTitle>
                {waterEntries.length > 0 && (
                  <Badge variant="outline">{waterEntries.length} entries</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="max-h-[300px] sm:max-h-[400px] overflow-auto">
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <p className="text-muted-foreground">Loading water entries...</p>
                </div>
              ) : waterEntries.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No entries yet</p>
              ) : (
                <div className="space-y-2">
                  {waterEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 border rounded hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-2">
                        <Droplet className="h-4 w-4 text-blue-400 shrink-0" />
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span className="font-medium">{entry.amount}{entry.unit}</span>
                          <span className="text-xs text-muted-foreground sm:before:content-['•'] sm:before:mx-1 sm:before:text-muted-foreground">
                            {entry.time}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveEntry(entry.id)} className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WaterTracking;
