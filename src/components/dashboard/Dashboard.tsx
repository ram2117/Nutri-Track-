
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "./StatCard";
import RecentMeals from "./RecentMeals";
import WaterProgressCard from "./WaterProgressCard";
import NutritionChart from "./NutritionChart";
import CalorieBarChart from "./CalorieBarChart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, Utensils, Droplet, Calendar, Flame, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface MealEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  time: string;
}

interface WaterEntry {
  id: string;
  amount: number;
  unit: string;
  time: string;
  created_at: string;
  user_id: string;
}

interface UserSettings {
  daily_water_goal: number;
}

interface UserProfile {
  age: number;
  gender: string;
  height: number;
  weight: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>({ daily_water_goal: 2500 });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [calorieData, setCalorieData] = useState<{date: string; calories: number}[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate today's date and one week ago
  const today = new Date().toISOString().split('T')[0];
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];
  
  useEffect(() => {
    if (user) {
      fetchDashboardData();
      
      // Set up a refresh interval to keep data updated
      const refreshInterval = setInterval(() => {
        fetchDashboardData();
      }, 10000); // Refresh every 10 seconds
      
      // Clean up the interval when component unmounts
      return () => clearInterval(refreshInterval);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      } else if (profileData) {
        setUserProfile({
          age: profileData.age,
          gender: profileData.gender,
          height: profileData.height,
          weight: profileData.weight
        });
      }

      // Fetch user settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Error fetching user settings:', settingsError);
      } else if (settingsData) {
        setUserSettings(settingsData);
      }

      // Fetch recent meal entries for the last week
      const { data: mealData, error: mealError } = await supabase
        .from('meal_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', oneWeekAgoStr)
        .order('date', { ascending: false })
        .order('time', { ascending: false });
      
      if (mealError) {
        console.error('Error fetching meal entries:', mealError);
      } else {
        setMealEntries(mealData || []);
      }

      // Fetch today's water entries
      const { data: waterData, error: waterError } = await supabase
        .from('water_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('time', today);
      
      if (waterError) {
        console.error('Error fetching water entries:', waterError);
      } else {
        setWaterEntries(waterData || []);
      }

      // Fetch last 7 days calorie data for chart
      const { data: calorieChartData, error: calorieChartError } = await supabase
        .from('meal_entries')
        .select('date, calories')
        .eq('user_id', user.id)
        .gte('date', oneWeekAgoStr)
        .order('date', { ascending: true });
      
      if (calorieChartError) {
        console.error('Error fetching calorie chart data:', calorieChartError);
      } else if (calorieChartData) {
        // Aggregate calories by date
        const aggregatedData: {[key: string]: number} = {};
        
        calorieChartData.forEach(entry => {
          if (!aggregatedData[entry.date]) {
            aggregatedData[entry.date] = 0;
          }
          aggregatedData[entry.date] += entry.calories;
        });
        
        // Fill in missing dates with zeros
        const result = [];
        const currentDate = new Date(oneWeekAgo);
        const endDate = new Date();
        
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          result.push({
            date: dateStr,
            calories: aggregatedData[dateStr] || 0
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        setCalorieData(result);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total water intake
  const totalWaterIntake = waterEntries.reduce((total, entry) => total + entry.amount, 0);
  
  // Filter today's meal entries
  const todaysMealEntries = mealEntries.filter(meal => meal.date === today);
  
  // Calculate stats from today's meal entries
  const calculateTodayStats = () => {
    if (todaysMealEntries.length === 0) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    const totals = todaysMealEntries.reduce((acc, meal) => {
      return {
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    return totals;
  };
  
  const todayStats = calculateTodayStats();

  // TODO: Implement proper calorie calculation based on user profile
  // This is a placeholder calculation and should be replaced with a more accurate formula
  const calculateRecommendedCalories = () => {
    if (!userProfile) return 2000; // Default value
    
    const { age, gender, height, weight } = userProfile;
    
    // Basic Basal Metabolic Rate (BMR) calculation using Mifflin-St Jeor Equation
    const bmr = gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    
    // Assume moderate activity level (multiply BMR by 1.55)
    return Math.round(bmr * 1.55);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            <StatCard
              title="Total Calories"
              value={todayStats.calories}
              description={`Today's calorie intake (Recommended: ${calculateRecommendedCalories()} kcal)`}
              icon={<Activity className="h-5 w-5" />}
            />
            
            <WaterProgressCard
              currentAmount={totalWaterIntake}
              goalAmount={userSettings.daily_water_goal}
            />
            
            <StatCard
              title="Protein"
              value={`${todayStats.protein}g`}
              description="Today's protein intake"
              icon={<Utensils className="h-5 w-5" />}
            />
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="w-full col-span-1 md:col-span-1 lg:col-span-2">
              <CalorieBarChart data={calorieData} isLoading={isLoading} />
            </div>
            <RecentMeals meals={mealEntries} isLoading={isLoading} />
          </div>
        </TabsContent>
        
        <TabsContent value="nutrition" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <NutritionChart 
              protein={todayStats.protein} 
              carbs={todayStats.carbs} 
              fat={todayStats.fat} 
            />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Nutrition Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <StatCard
                      title="Calories"
                      value={todayStats.calories}
                      className="shadow-none border-0 p-2"
                    />
                    <StatCard
                      title="Protein"
                      value={`${todayStats.protein}g`}
                      className="shadow-none border-0 p-2"
                    />
                    <StatCard
                      title="Carbs"
                      value={`${todayStats.carbs}g`}
                      className="shadow-none border-0 p-2"
                    />
                    <StatCard
                      title="Fat"
                      value={`${todayStats.fat}g`}
                      className="shadow-none border-0 p-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="md:col-span-2">
              <RecentMeals meals={mealEntries} isLoading={isLoading} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            <StatCard
              title="Meal Entries"
              value={mealEntries.length}
              description="Recent logged meals"
              icon={<Utensils className="h-5 w-5" />}
            />
            
            <StatCard
              title="Water Entries"
              value={waterEntries.length}
              description="Today's water logs"
              icon={<Droplet className="h-5 w-5" />}
            />
            
            <StatCard
              title="Active Tracking"
              value={waterEntries.length + mealEntries.length}
              description="Total tracking entries"
              icon={<Activity className="h-5 w-5" />}
            />
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 md:col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Activity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Your recent activity overview and health tracking history.
                </p>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Droplet className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Water tracking active</p>
                          <p className="text-sm text-muted-foreground">
                            {waterEntries.length > 0 
                              ? `${totalWaterIntake}ml of ${userSettings.daily_water_goal}ml goal (${Math.round((totalWaterIntake / userSettings.daily_water_goal) * 100)}%)`
                              : 'No water tracking data for today'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <Utensils className="h-4 w-4 text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Meal tracking active</p>
                          <p className="text-sm text-muted-foreground">
                            {mealEntries.length > 0 
                              ? `${mealEntries.length} meals logged recently`
                              : 'No recent meal entries found'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="bg-orange-100 p-2 rounded-full">
                          <Calendar className="h-4 w-4 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Daily tracking</p>
                          <p className="text-sm text-muted-foreground">
                            View your complete history in the History tab
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
