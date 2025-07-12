"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, User, Lightbulb, GraduationCap, Code, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/partner-finder", icon: Lightbulb, label: "Partner Finder" },
  { href: "/alumni-projects", icon: GraduationCap, label: "Alumni Projects" },
  { href: "/code-editor", icon: Code, label: "Code Editor" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
        <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
                 <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-primary text-glow"
                >
                    <path d="M10.19 1.44a1 1 0 0 0-1.02.06l-4.5 3.22a1 1 0 0 0-.47.85v12.86a1 1 0 0 0 .47.85l4.5 3.22a1 1 0 0 0 1.02.06l11-7.86a1 1 0 0 0 0-1.8l-11-7.86Z" />
                    <path d="m11 13-6 4.29" />
                    <path d="m11 13-6-4.29" />
                    <path d="M11 13v9" />
                    <path d="M11 13 22 5" />
                </svg>
                <span className="text-xl font-bold font-headline text-glow">CampusConnect</span>
            </div>
        </SidebarHeader>
        <SidebarContent className="p-4">
            <SidebarMenu>
                {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <Link href={item.href}>
                            <SidebarMenuButton isActive={pathname === item.href} className="gap-3">
                                <item.icon className="h-5 w-5 text-primary text-glow" />
                                <span>{item.label}</span>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-3 flex-1 overflow-hidden">
                    <Avatar>
                        <AvatarImage src="https://placehold.co/40x40" alt="User" />
                        <AvatarFallback>CC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-sm truncate">User Name</p>
                        <p className="text-xs text-muted-foreground truncate">user@campus.edu</p>
                    </div>
                </Link>
                 <Link href="/">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                        <LogOut className="h-5 w-5"/>
                    </Button>
                 </Link>
            </div>
        </SidebarFooter>
    </Sidebar>
  );
}
