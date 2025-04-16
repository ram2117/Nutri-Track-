import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Droplet,
  Utensils,
  Clock,
  History,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

// Define navigation items
const navItems = [
  { 
    title: "Dashboard", 
    icon: LayoutDashboard, 
    path: "/", 
    description: "Overview of your health metrics"
  },
  { 
    title: "Water Tracking", 
    icon: Droplet, 
    path: "/water-tracking", 
    description: "Track your daily water intake"
  },
  { 
    title: "Meal Logging", 
    icon: Utensils, 
    path: "/meal-logging", 
    description: "Log and track your meals"
  },
  { 
    title: "History", 
    icon: History, 
    path: "/history", 
    description: "View your past activities"
  },
  { 
    title: "Reminders", 
    icon: Clock, 
    path: "/reminders", 
    description: "Set health reminders"
  },
  { 
    title: "Settings", 
    icon: Settings, 
    path: "/settings", 
    description: "Manage your account settings"
  }
];

export const AppSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();
  
  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [location.pathname, isMobile, setOpenMobile]);
  
  if (!user) return null;

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">F</span>
          </div>
          <span className="font-bold text-xl">Nutri Track AI</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                isActive={location.pathname === item.path}
                tooltip={item.description}
              >
                <Link to={item.path} className="w-full">
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          Nutri Track AI Health App © {new Date().getFullYear()}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
