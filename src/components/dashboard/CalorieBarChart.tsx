
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface MealData {
  date: string;
  calories: number;
}

interface CalorieBarChartProps {
  data: MealData[];
  isLoading?: boolean;
}

const CalorieBarChart = ({ data, isLoading = false }: CalorieBarChartProps) => {
  // Format dates for display
  const formattedData = data.map(entry => ({
    ...entry,
    formattedDate: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-base sm:text-lg font-medium">Calorie Intake</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 sm:h-72">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-64 sm:h-72 text-muted-foreground">
            <p>No data available</p>
          </div>
        ) : (
          <div className="h-72 sm:h-80 md:h-64 lg:h-72">
            <ChartContainer
              config={{
                calories: { color: "#8b5cf6", label: "Calories" },
              }}
            >
              <BarChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="formattedDate"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tick={{ fontSize: '10px', fill: 'var(--muted-foreground)' }}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(value) => `${value}`}
                  width={35}
                  tick={{ fontSize: '10px', fill: 'var(--muted-foreground)' }}
                />
                <Bar
                  dataKey="calories"
                  radius={[4, 4, 0, 0]}
                  fill="var(--color-calories, #8b5cf6)"
                  barSize={20}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value} kcal`, "Calories"]}
                    />
                  }
                />
              </BarChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalorieBarChart;
