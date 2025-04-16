
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Droplet, Plus, Utensils } from "lucide-react";
import { Link } from "react-router-dom";

const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button asChild variant="outline" className="justify-start">
          <Link to="/meal-logging">
            <Camera className="mr-2 h-4 w-4" />
            Log meal with camera
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="justify-start">
          <Link to="/water-tracking">
            <Droplet className="mr-2 h-4 w-4" />
            Track water intake
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="justify-start">
          <Link to="/reminders">
            <Plus className="mr-2 h-4 w-4" />
            Set reminder
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="justify-start">
          <Link to="/history">
            <Utensils className="mr-2 h-4 w-4" />
            View meal history
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
