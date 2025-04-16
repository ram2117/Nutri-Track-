
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReminders } from "@/hooks/use-reminders";
import { Skeleton } from "@/components/ui/skeleton";

const Reminders = () => {
  const { reminders, loading, addReminder, deleteReminder } = useReminders();
  const [newReminder, setNewReminder] = useState({ title: "", time: "", type: "medication" });

  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.time) {
      toast.error("Please fill all fields");
      return;
    }
    
    const result = await addReminder(newReminder.title, newReminder.time, newReminder.type);
    
    if (result) {
      setNewReminder({ title: "", time: "", type: "medication" });
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Clock className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Reminders</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add New Reminder</CardTitle>
          <CardDescription>Set up reminders for your health activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="title">Reminder Title</Label>
              <Input 
                id="title" 
                placeholder="Take medication" 
                value={newReminder.title}
                onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input 
                id="time" 
                type="time" 
                value={newReminder.time}
                onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select 
                value={newReminder.type}
                onValueChange={(value) => setNewReminder({...newReminder, type: value})}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="hydration">Hydration</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="meal">Meal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddReminder} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" /> Add Reminder
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Reminders</CardTitle>
          <CardDescription>Manage your active reminders</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex flex-col space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <div className="flex items-center">
                      <Skeleton className="h-3 w-3 mr-1 rounded-full" />
                      <Skeleton className="h-3 w-16 mr-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              ))}
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No reminders set. Add one above to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex flex-col">
                    <span className="font-medium">{reminder.title}</span>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>{reminder.time}</span>
                      <span className="ml-2 capitalize">{reminder.type}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteReminder(reminder.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reminders;
