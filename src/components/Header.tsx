import React from "react";
import { Link } from "react-router-dom";
import { LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        {isMobile && <SidebarTrigger />}
        {isMobile && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-base">F</span>
            </div>
            <span className="font-bold text-lg truncate">Nutri Track AI</span>
          </Link>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {!isMobile && <SidebarTrigger />}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 z-50 bg-background">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium leading-none">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="w-full cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Header;
