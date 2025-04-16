import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { SettingsTestData } from "@/components/SettingsTestData";

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-4 sm:py-8 px-2 sm:px-4">
      <div className="flex items-center mb-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Signed in as:</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <Button 
                onClick={handleSignOut} 
                variant="outline" 
                disabled={isLoading}
              >
                {isLoading ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          ) : (
            <p>Not signed in</p>
          )}
        </CardContent>
      </Card>

      {/* Add test data component */}
      {user && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Data</CardTitle>
            <CardDescription>Generate test data for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Use these buttons to create sample data for testing purposes.
              </p>
              <div className="flex flex-wrap gap-2">
                
                <Button 
                  onClick={async () => {
                    const { createTestReminders } = await import('@/lib/createTestData');
                    try {
                      const result = await createTestReminders(user.id);
                      if (result.success) {
                        toast.success('Test reminders created successfully');
                      } else {
                        toast.error('Failed to create test reminders');
                      }
                    } catch (error) {
                      console.error('Error creating test reminders:', error);
                      toast.error('An error occurred while creating test reminders');
                    }
                  }} 
                  variant="outline"
                >
                  Create Test Reminders
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>App Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Version</h3>
              <p className="text-sm text-gray-600">Nutri Track AI 1.0.0</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">About</h3>
              <p className="text-sm text-gray-600">
                Nutri Track AI helps you track your nutrition by analyzing your food with AI technology.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
