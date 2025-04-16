import React from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="container py-4 sm:py-8 px-2 sm:px-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Nutri Track AI Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Track your nutrition and wellness journey
        </p>
      </div>

      <Dashboard />
    </div>
  );
};

export default Index;
