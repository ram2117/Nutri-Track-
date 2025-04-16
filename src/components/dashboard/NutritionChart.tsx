
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface NutritionChartProps {
  protein: number;
  carbs: number;
  fat: number;
}

const NutritionChart = ({ protein, carbs, fat }: NutritionChartProps) => {
  const total = protein + carbs + fat;
  
  const data = [
    { name: "Protein", value: protein, color: "#4ade80" },  // Green
    { name: "Carbs", value: carbs, color: "#fbbf24" },      // Yellow
    { name: "Fat", value: fat, color: "#60a5fa" }           // Blue
  ].filter(item => item.value > 0);

  // Calculate percentages
  const proteinPercentage = total > 0 ? Math.round((protein / total) * 100) : 0;
  const carbsPercentage = total > 0 ? Math.round((carbs / total) * 100) : 0;
  const fatPercentage = total > 0 ? Math.round((fat / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Macronutrient Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-52 md:h-56 lg:h-64">
          <ChartContainer 
            config={{
              protein: { color: "#4ade80", label: "Protein" },
              carbs: { color: "#fbbf24", label: "Carbs" },
              fat: { color: "#60a5fa", label: "Fat" }
            }}
          >
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent />
                }
              />
            </PieChart>
          </ChartContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-1 md:gap-2 p-3 md:p-4 lg:p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="text-xs md:text-sm font-medium">Protein</span>
            </div>
            <div className="mt-1 md:mt-2">
              <span className="text-lg md:text-xl font-bold">{proteinPercentage}%</span>
            </div>
            <div className="text-xs text-muted-foreground">{protein}g</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="text-xs md:text-sm font-medium">Carbs</span>
            </div>
            <div className="mt-1 md:mt-2">
              <span className="text-lg md:text-xl font-bold">{carbsPercentage}%</span>
            </div>
            <div className="text-xs text-muted-foreground">{carbs}g</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-blue-400" />
              <span className="text-xs md:text-sm font-medium">Fat</span>
            </div>
            <div className="mt-1 md:mt-2">
              <span className="text-lg md:text-xl font-bold">{fatPercentage}%</span>
            </div>
            <div className="text-xs text-muted-foreground">{fat}g</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionChart;
