
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History as HistoryIcon, Calendar, Filter, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Interface for water entry data
interface WaterEntry {
  id: string;
  amount: number;
  time: string;
  unit: string;
  date: string;
}

// Interface for meal/nutrition entry data
interface MealEntry {
  id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  meal_type: string;
  name: string;
}

// Interface for chart data
interface ChartDataPoint {
  date: string;
  amount?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

const History = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("week");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [nutritionMetric, setNutritionMetric] = useState("calories");
  const [waterData, setWaterData] = useState<ChartDataPoint[]>([]);
  const [nutritionData, setNutritionData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState({
    today: { waterAmount: 0, calories: 0, mealsLogged: 0 },
    yesterday: { waterAmount: 0, calories: 0, mealsLogged: 0 },
    twoDaysAgo: { waterAmount: 0, calories: 0, mealsLogged: 0 }
  });

  // Helper function to format date as YYYY-MM-DD
  const formatDateToYMD = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Helper function to get formatted day name
  const getDayName = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  };

  // Get date range based on selection
  const getDateRange = (): { start: Date, end: Date } => {
    const end = new Date();
    let start = new Date();
    
    if (dateRange === "week") {
      start.setDate(end.getDate() - 6); // Last 7 days including today
    } else if (dateRange === "month") {
      start.setDate(end.getDate() - 29); // Last 30 days including today
    } else if (dateRange === "custom" && startDate && endDate) {
      return {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }
    
    return { start, end };
  };

  // Fetch data when component mounts, user changes, or date range changes
  useEffect(() => {
    if (!user) return;
    fetchHistoryData();
  }, [user, dateRange, startDate, endDate]);

  const fetchHistoryData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { start, end } = getDateRange();
      const startStr = formatDateToYMD(start);
      const endStr = formatDateToYMD(end);
      
      // Fetch water entries
      await fetchWaterData(startStr, endStr);
      
      // Fetch meal/nutrition entries
      await fetchNutritionData(startStr, endStr);
      
      // Fetch daily stats
      await fetchDailyStats();
      
    } catch (error) {
      console.error('Error fetching history data:', error);
      toast.error('Failed to load history data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWaterData = async (startDate: string, endDate: string) => {
    try {
      // Get water entries from Supabase
      const { data: waterEntries, error } = await supabase
        .from('water_entries')
        .select('id, amount, unit, time')
        .eq('user_id', user.id)
        .gte('time', `${startDate}T00:00:00`)
        .lte('time', `${endDate}T23:59:59`)
        .order('time', { ascending: true });

      if (error) throw error;

      // Process the water entries by day
      const waterByDay = new Map<string, number>();
      
      if (waterEntries) {
        waterEntries.forEach(entry => {
          const date = new Date(entry.time);
          const dayKey = formatDateToYMD(date);
          const amount = entry.amount;
          
          waterByDay.set(dayKey, (waterByDay.get(dayKey) || 0) + amount);
        });
      }

      // Generate chart data (ensure we have entries for each day in the range)
      const chartData: ChartDataPoint[] = [];
      const dateIterator = new Date(startDate);
      const lastDate = new Date(endDate);
      
      while (dateIterator <= lastDate) {
        const dayKey = formatDateToYMD(dateIterator);
        const displayDate = getDayName(dateIterator);
        
        chartData.push({
          date: displayDate,
          amount: (waterByDay.get(dayKey) || 0) / 1000 // Convert to liters for display
        });
        
        dateIterator.setDate(dateIterator.getDate() + 1);
      }
      
      setWaterData(chartData);
    } catch (error) {
      console.error('Error fetching water data:', error);
      throw error;
    }
  };

  const fetchNutritionData = async (startDate: string, endDate: string) => {
    try {
      // Get meal entries from Supabase
      const { data: mealEntries, error } = await supabase
        .from('meal_entries')
        .select('id, calories, protein, carbs, fat, date, meal_type')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;

      // Process the meal entries by day
      const mealsByDay = new Map<string, { calories: number, protein: number, carbs: number, fat: number }>();
      
      if (mealEntries) {
        mealEntries.forEach(entry => {
          const dayKey = entry.date;
          
          if (!mealsByDay.has(dayKey)) {
            mealsByDay.set(dayKey, { calories: 0, protein: 0, carbs: 0, fat: 0 });
          }
          
          const dayStats = mealsByDay.get(dayKey)!;
          dayStats.calories += entry.calories;
          dayStats.protein += entry.protein;
          dayStats.carbs += entry.carbs;
          dayStats.fat += entry.fat;
        });
      }

      // Generate chart data (ensure we have entries for each day in the range)
      const chartData: ChartDataPoint[] = [];
      const dateIterator = new Date(startDate);
      const lastDate = new Date(endDate);
      
      while (dateIterator <= lastDate) {
        const dayKey = formatDateToYMD(dateIterator);
        const displayDate = getDayName(dateIterator);
        const dayStats = mealsByDay.get(dayKey) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
        
        chartData.push({
          date: displayDate,
          calories: dayStats.calories,
          protein: dayStats.protein,
          carbs: dayStats.carbs,
          fat: dayStats.fat
        });
        
        dateIterator.setDate(dateIterator.getDate() + 1);
      }
      
      setNutritionData(chartData);
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      throw error;
    }
  };

  const fetchDailyStats = async () => {
    try {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(today.getDate() - 2);
      
      const todayStr = formatDateToYMD(today);
      const yesterdayStr = formatDateToYMD(yesterday);
      const twoDaysAgoStr = formatDateToYMD(twoDaysAgo);
      
      // Fetch today's water data
      const { data: todayWater } = await supabase
        .from('water_entries')
        .select('amount')
        .eq('user_id', user.id)
        .gte('time', `${todayStr}T00:00:00`)
        .lte('time', `${todayStr}T23:59:59`);
      
      // Fetch yesterday's water data
      const { data: yesterdayWater } = await supabase
        .from('water_entries')
        .select('amount')
        .eq('user_id', user.id)
        .gte('time', `${yesterdayStr}T00:00:00`)
        .lte('time', `${yesterdayStr}T23:59:59`);
      
      // Fetch two days ago water data
      const { data: twoDaysAgoWater } = await supabase
        .from('water_entries')
        .select('amount')
        .eq('user_id', user.id)
        .gte('time', `${twoDaysAgoStr}T00:00:00`)
        .lte('time', `${twoDaysAgoStr}T23:59:59`);
      
      // Fetch today's meal data
      const { data: todayMeals } = await supabase
        .from('meal_entries')
        .select('calories')
        .eq('user_id', user.id)
        .eq('date', todayStr);
      
      // Fetch yesterday's meal data
      const { data: yesterdayMeals } = await supabase
        .from('meal_entries')
        .select('calories')
        .eq('user_id', user.id)
        .eq('date', yesterdayStr);
      
      // Fetch two days ago meal data
      const { data: twoDaysAgoMeals } = await supabase
        .from('meal_entries')
        .select('calories')
        .eq('user_id', user.id)
        .eq('date', twoDaysAgoStr);
      
      // Calculate totals
      const todayWaterTotal = todayWater ? todayWater.reduce((sum, entry) => sum + entry.amount, 0) / 1000 : 0;
      const yesterdayWaterTotal = yesterdayWater ? yesterdayWater.reduce((sum, entry) => sum + entry.amount, 0) / 1000 : 0;
      const twoDaysAgoWaterTotal = twoDaysAgoWater ? twoDaysAgoWater.reduce((sum, entry) => sum + entry.amount, 0) / 1000 : 0;
      
      const todayCaloriesTotal = todayMeals ? todayMeals.reduce((sum, entry) => sum + entry.calories, 0) : 0;
      const yesterdayCaloriesTotal = yesterdayMeals ? yesterdayMeals.reduce((sum, entry) => sum + entry.calories, 0) : 0;
      const twoDaysAgoCaloriesTotal = twoDaysAgoMeals ? twoDaysAgoMeals.reduce((sum, entry) => sum + entry.calories, 0) : 0;
      
      setDailyStats({
        today: {
          waterAmount: todayWaterTotal,
          calories: todayCaloriesTotal,
          mealsLogged: todayMeals ? todayMeals.length : 0
        },
        yesterday: {
          waterAmount: yesterdayWaterTotal,
          calories: yesterdayCaloriesTotal,
          mealsLogged: yesterdayMeals ? yesterdayMeals.length : 0
        },
        twoDaysAgo: {
          waterAmount: twoDaysAgoWaterTotal,
          calories: twoDaysAgoCaloriesTotal,
          mealsLogged: twoDaysAgoMeals ? twoDaysAgoMeals.length : 0
        }
      });
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      throw error;
    }
  };

  // Calculate average values for the selected metric
  const calculateAverage = (metric: string): string => {
    if (nutritionData.length === 0) return "0";
    
    const sum = nutritionData.reduce((total, day) => total + (day[metric as keyof ChartDataPoint] as number || 0), 0);
    const avg = sum / nutritionData.length;
    
    return metric === 'calories' ? avg.toFixed(0) : avg.toFixed(1);
  };

  // Calculate average water intake
  const calculateAverageWater = (): string => {
    if (waterData.length === 0) return "0.0";
    
    const sum = waterData.reduce((total, day) => total + (day.amount || 0), 0);
    return (sum / waterData.length).toFixed(1);
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HistoryIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">History</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={fetchHistoryData}
            disabled={isLoading}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Calendar className="mr-2 h-4 w-4" /> 
            <span>Date Range</span>
          </Button>
          <Button variant="outline" size="icon" className="hidden md:flex">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>View History</CardTitle>
              <CardDescription>Select time period to view</CardDescription>
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {dateRange === "custom" && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <Tabs defaultValue="water">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="water">Water Intake</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            </TabsList>
            
            <TabsContent value="water" className="pt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p className="text-muted-foreground">Loading water data...</p>
                </div>
              ) : waterData.length === 0 ? (
                <div className="flex justify-center py-8">
                  <p className="text-muted-foreground">No water data available for the selected period</p>
                </div>
              ) : (
                <>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={waterData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} L`, 'Water']} />
                        <Area type="monotone" dataKey="amount" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-medium text-center">Average Water Intake: {calculateAverageWater()}L per day</h3>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="nutrition" className="pt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p className="text-muted-foreground">Loading nutrition data...</p>
                </div>
              ) : nutritionData.length === 0 ? (
                <div className="flex justify-center py-8">
                  <p className="text-muted-foreground">No nutrition data available for the selected period</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-2">
                    <Select value={nutritionMetric} onValueChange={setNutritionMetric}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Metric" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="calories">Calories</SelectItem>
                        <SelectItem value="protein">Protein</SelectItem>
                        <SelectItem value="carbs">Carbs</SelectItem>
                        <SelectItem value="fat">Fat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={nutritionData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey={nutritionMetric} fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-medium text-center">
                      Average {nutritionMetric === "calories" ? `Calorie Intake: ${calculateAverage('calories')} kcal` : 
                        nutritionMetric === "protein" ? `Protein Intake: ${calculateAverage('protein')}g` : 
                        nutritionMetric === "carbs" ? `Carb Intake: ${calculateAverage('carbs')}g` : 
                        `Fat Intake: ${calculateAverage('fat')}g`} per day
                    </h3>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Detailed log of your activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Loading activity data...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4 pb-4">
                <div className="text-xs text-muted-foreground mb-1">Today</div>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Water Intake:</span> {dailyStats.today.waterAmount.toFixed(1)}L
                  </div>
                  <div>
                    <span className="font-medium">Calories:</span> {dailyStats.today.calories} kcal
                  </div>
                  <div>
                    <span className="font-medium">Meals Logged:</span> {dailyStats.today.mealsLogged}
                  </div>
                </div>
              </div>
              
              <div className="border-l-4 border-muted pl-4 pb-4">
                <div className="text-xs text-muted-foreground mb-1">Yesterday</div>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Water Intake:</span> {dailyStats.yesterday.waterAmount.toFixed(1)}L
                  </div>
                  <div>
                    <span className="font-medium">Calories:</span> {dailyStats.yesterday.calories} kcal
                  </div>
                  <div>
                    <span className="font-medium">Meals Logged:</span> {dailyStats.yesterday.mealsLogged}
                  </div>
                </div>
              </div>
              
              <div className="border-l-4 border-muted pl-4 pb-4">
                <div className="text-xs text-muted-foreground mb-1">2 Days Ago</div>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Water Intake:</span> {dailyStats.twoDaysAgo.waterAmount.toFixed(1)}L
                  </div>
                  <div>
                    <span className="font-medium">Calories:</span> {dailyStats.twoDaysAgo.calories} kcal
                  </div>
                  <div>
                    <span className="font-medium">Meals Logged:</span> {dailyStats.twoDaysAgo.mealsLogged}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
