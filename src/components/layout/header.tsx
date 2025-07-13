"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import LoadingLink from "../ui/loading-link";

export function AppHeader() {
  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background/50 backdrop-blur-sm px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1">
        {/* Can add a global search bar here if needed */}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors"/>
        </Button>
        <LoadingLink href="/profile">
          <Button variant="ghost" size="icon">
              <User className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors"/>
          </Button>
        </LoadingLink>
      </div>
    </header>
  );
}
