
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
import { usePathname, useRouter } from "next/navigation";
import { Home, User, Lightbulb, GraduationCap, Code, Settings, LogOut, UserCog, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { getUserById, User as CampusUser } from "@/services/user";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { User as FirebaseUser } from "firebase/auth";
import LoadingLink from "../ui/loading-link";

interface UserProfile {
  fullName: string;
  email: string;
  profilePhotoURL?: string;
  isVerified: boolean;
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserData = async (firebaseUser: FirebaseUser) => {
      const campusUser: CampusUser | null = await getUserById(firebaseUser.uid);
      if (campusUser) {
        // A user is considered verified if both their primary AND optional (if it exists) emails are verified.
        const isPrimaryVerified = firebaseUser.emailVerified && campusUser.emailPrimaryVerified;
        const isOptionalVerified = campusUser.emailOptional ? campusUser.emailOptionalVerified : true;

        setUserProfile({
            fullName: `${campusUser.firstName} ${campusUser.lastName || ''}`.trim(),
            email: campusUser.emailPrimary,
            profilePhotoURL: campusUser.profilePhotoURL,
            isVerified: isPrimaryVerified && isOptionalVerified,
        });
      } else {
          console.log("User document not found in the users collection.");
      }
    };
    
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchUserData(user);
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, [pathname]); // Re-fetch on route change to update verification status

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/partner-finder", icon: Lightbulb, label: "Partner Finder" },
    { href: "/alumni-projects", icon: GraduationCap, label: "Alumni Projects" },
    { href: "/code-editor", icon: Code, label: "Code Editor" },
    { href: "/chat", icon: MessageSquare, label: "Chat" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push("/login");
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Sidebar>
        <SidebarHeader className="p-4">
            <LoadingLink href="/dashboard" className="flex items-center gap-2">
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
            </LoadingLink>
        </SidebarHeader>
        <SidebarContent className="p-4">
            <SidebarMenu>
                {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <LoadingLink href={item.href}>
                            <SidebarMenuButton isActive={pathname.startsWith(item.href)} className="gap-3">
                                <item.icon className="h-5 w-5 text-primary text-glow" />
                                <span>{item.label}</span>
                            </SidebarMenuButton>
                        </LoadingLink>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-border">
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative flex items-center gap-3 w-full text-left rounded-md p-2 hover:bg-muted transition-colors">
                  <Avatar>
                      <AvatarImage src={userProfile?.profilePhotoURL || "https://placehold.co/40x40"} alt="User" />
                      <AvatarFallback>{userProfile?.fullName ? userProfile.fullName.charAt(0) : 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-sm truncate">{userProfile?.fullName || 'User Name'}</p>
                      <p className="text-xs text-muted-foreground truncate">{userProfile?.email || 'user@campus.edu'}</p>
                  </div>
                  {userProfile && !userProfile.isVerified && (
                     <div className="absolute bottom-1 left-1 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                  )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 mb-2" side="top" align="start">
              <div className="flex flex-col space-y-1">
                <LoadingLink href="/account">
                  <Button variant="ghost" className="w-full justify-start">
                    <UserCog className="mr-2 h-4 w-4" />
                    Account Management
                  </Button>
                </LoadingLink>
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4"/>
                    Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </SidebarFooter>
    </Sidebar>
  );
}
