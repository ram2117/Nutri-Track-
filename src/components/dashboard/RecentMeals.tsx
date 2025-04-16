
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils } from "lucide-react";

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

interface RecentMealsProps {
  meals: MealEntry[];
  isLoading?: boolean;
}

const RecentMeals = ({ meals, isLoading = false }: RecentMealsProps) => {
  // Sort meals by date and time, most recent first
  const sortedMeals = [...meals].sort((a, b) => {
    // First compare dates
    const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
    
    // If dates are the same, compare times
    if (dateComparison === 0) {
      return b.time.localeCompare(a.time);
    }
    
    return dateComparison;
  });

  return (
    <Card className="col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Recent Meals (Last 7 Days)</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : meals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Utensils className="h-10 w-10 mb-2" />
            <p>No recent meals found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedMeals.map((meal) => (
              <div key={meal.id} className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Utensils className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{meal.name}</p>
                    <span className="text-sm text-muted-foreground">{`${meal.date} ${meal.time}`}</span>
                  </div>
                  <div className="text-sm text-muted-foreground flex gap-2">
                    <span>{meal.calories} kcal</span>
                    <span className="text-green-600">{meal.protein}g protein</span>
                    <span className="text-amber-600">{meal.carbs}g carbs</span>
                    <span className="text-blue-600">{meal.fat}g fat</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentMeals;
