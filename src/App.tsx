
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import WaterTracking from "./pages/WaterTracking";
import MealLogging from "./pages/MealLogging";
import History from "./pages/History";
import Reminders from "./pages/Reminders";
import ProfileSetup from "./pages/ProfileSetup";  // New import

import { ApiKeyProvider } from "./contexts/ApiKeyContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ApiKeyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />  {/* New route */}
              
              {/* Protected routes with sidebar layout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/water-tracking" element={<WaterTracking />} />
                  <Route path="/meal-logging" element={<MealLogging />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/reminders" element={<Reminders />} />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </ApiKeyProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
