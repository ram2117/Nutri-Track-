
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import { AppSidebar } from "./Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const MainLayout = () => {
  const location = useLocation();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col min-h-screen">
            <div className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
              <Header />
            </div>
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
