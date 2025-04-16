
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { NutritionData } from "@/lib/api";

interface NutritionDisplayProps {
  nutrition: NutritionData | null;
  isLoading: boolean;
}

const NutritionDisplay: React.FC<NutritionDisplayProps> = ({ 
  nutrition, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <Card className="w-full mt-4 overflow-hidden">
        <CardHeader className="animate-pulse-light bg-muted">
          <div className="h-7 bg-muted-foreground/20 rounded w-2/3"></div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-5 bg-muted-foreground/20 rounded w-1/4"></div>
                <div className="h-5 bg-muted-foreground/20 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nutrition) {
    return null;
  }

  return (
    <Card className="w-full mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">{nutrition.foodName}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-food-green/10 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600">Calories</div>
            <div className="text-2xl font-bold text-food-green-dark">
              {nutrition.calories}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600">Protein</div>
            <div className="text-2xl font-bold text-blue-600">
              {nutrition.protein}
            </div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600">Carbs</div>
            <div className="text-2xl font-bold text-amber-600">
              {nutrition.carbs}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-600">Fat</div>
            <div className="text-2xl font-bold text-red-600">
              {nutrition.fat}
            </div>
          </div>
        </div>

        <Separator className="my-4" />
        
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-gray-600">Ingredients</h3>
          <div className="flex flex-wrap gap-2">
            {nutrition.ingredients.map((ingredient, index) => (
              <Badge key={index} variant="outline" className="bg-food-gray-light">
                {ingredient}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="my-4" />
        
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-gray-600">Details</h3>
          <p className="text-sm text-gray-800">{nutrition.details}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionDisplay;
