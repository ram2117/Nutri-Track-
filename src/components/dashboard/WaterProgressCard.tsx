
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface WaterProgressCardProps {
  currentAmount: number;
  goalAmount: number;
  unit?: string;
}

const WaterProgressCard = ({
  currentAmount,
  goalAmount,
  unit = "ml"
}: WaterProgressCardProps) => {
  const percentage = Math.min(Math.round((currentAmount / goalAmount) * 100), 100);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Water Intake</CardTitle>
        <Droplet className="h-4 w-4 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold">{currentAmount}{unit}</span>
          <span className="text-sm text-muted-foreground">Goal: {goalAmount}{unit}</span>
        </div>
        <div className="space-y-1">
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">{percentage}% of daily goal</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterProgressCard;
