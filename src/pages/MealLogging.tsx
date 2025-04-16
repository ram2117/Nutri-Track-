
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Utensils, Clock, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ImageCapture from "@/components/ImageCapture";
import NutritionDisplay from "@/components/NutritionDisplay";
import { NutritionData, analyzeImage } from "@/lib/api";

interface MealEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
  time: string;
  date: string;
}

const MealLogging = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [nutrition, setNutrition] = useState<NutritionData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>("breakfast");

  // Fetch meal entries when component mounts or user changes
  useEffect(() => {
    if (!user) return;
    fetchMeals();
  }, [user]);

  const fetchMeals = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('meal_entries')
        .select('id, name, calories, protein, carbs, fat, meal_type, time, date')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('time', { ascending: false }) as any;

      if (error) {
        throw error;
      }

      if (data) {
        const formattedMeals = data.map(meal => ({
          id: meal.id,
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          mealType: meal.meal_type,
          time: meal.time,
          date: meal.date
        }));
        setMeals(formattedMeals);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
      toast.error('Failed to load your meal entries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageCaptured = (imageData: string) => {
    setCapturedImage(imageData);
    setNutrition(null);
  };

  const handleAnalyze = async () => {
    if (!capturedImage) {
      toast.error("Please capture or upload an image first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeImage(capturedImage);
      setNutrition(result);
    } catch (error) {
      console.error("Error during analysis:", error);
      toast.error("Failed to analyze the image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!user || !nutrition) {
      toast.error("Please analyze a food image first");
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    try {
      // Parse the nutrition values
      const calories = parseInt(nutrition.calories) || 0;
      const protein = parseInt(nutrition.protein) || 0;
      const carbs = parseInt(nutrition.carbs) || 0;
      const fat = parseInt(nutrition.fat) || 0;
      
      const { data, error } = await supabase
        .from('meal_entries')
        .insert({
          user_id: user.id,
          name: nutrition.foodName,
          calories: calories,
          protein: protein,
          carbs: carbs,
          fat: fat,
          meal_type: selectedMealType,
          time: currentTime,
          date: today
        } as any)
        .select('id')
        .single() as any;
        
      if (error) throw error;
      
      if (data) {
        const newMeal: MealEntry = {
          id: data.id,
          name: nutrition.foodName,
          calories: calories,
          protein: protein,
          carbs: carbs,
          fat: fat,
          mealType: selectedMealType,
          time: currentTime,
          date: today
        };
        
        setMeals([newMeal, ...meals]);
        setCapturedImage(null);
        setNutrition(null);
        toast.success("Meal logged successfully");
      }
    } catch (error: any) {
      console.error('Error saving meal:', error);
      toast.error('Failed to save meal entry');
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast": return "🍳";
      case "lunch": return "🥪";
      case "dinner": return "🍽️";
      case "snack": return "🍎";
      default: return "🍽️";
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Utensils className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Meal Logging</h1>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchMeals}
          disabled={isLoading}
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue="log">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="log">Log a Meal</TabsTrigger>
          <TabsTrigger value="history">Meal History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="log">
          <Card>
            <CardHeader>
              <CardTitle>Snap & Track</CardTitle>
              <CardDescription>Take a photo of your food to automatically log nutrition details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageCapture onImageCaptured={handleImageCaptured} />
              
              {capturedImage && !nutrition && !isAnalyzing && (
                <div className="flex justify-center mt-4">
                  <Button 
                    onClick={handleAnalyze} 
                    className="bg-food-green hover:bg-food-green-dark"
                  >
                    Analyze Food
                  </Button>
                </div>
              )}
              
              <NutritionDisplay nutrition={nutrition} isLoading={isAnalyzing} />
              
              {nutrition && (
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="meal-type">Meal Type</Label>
                    <Select 
                      value={selectedMealType}
                      onValueChange={setSelectedMealType}
                    >
                      <SelectTrigger id="meal-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={handleSaveMeal} 
                    className="w-full bg-food-green hover:bg-food-green-dark"
                  >
                    Save to Meal Log
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Meals</CardTitle>
              <CardDescription>Your logged meals from today</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p className="text-muted-foreground">Loading meal entries...</p>
                </div>
              ) : meals.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No meals logged yet. Start by adding a meal.
                </div>
              ) : (
                <div className="space-y-4">
                  {meals.map((meal) => (
                    <div key={meal.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{getMealTypeIcon(meal.mealType)}</span>
                          <div>
                            <h3 className="font-medium">{meal.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="mr-1 h-3 w-3" />
                              <span>{meal.time}</span>
                              <span className="ml-2 capitalize">{meal.mealType}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{meal.calories} kcal</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="text-center p-1 bg-secondary/30 rounded">
                          <p className="text-xs text-muted-foreground">Protein</p>
                          <p className="font-medium">{meal.protein}g</p>
                        </div>
                        <div className="text-center p-1 bg-secondary/30 rounded">
                          <p className="text-xs text-muted-foreground">Carbs</p>
                          <p className="font-medium">{meal.carbs}g</p>
                        </div>
                        <div className="text-center p-1 bg-secondary/30 rounded">
                          <p className="text-xs text-muted-foreground">Fat</p>
                          <p className="font-medium">{meal.fat}g</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MealLogging;
