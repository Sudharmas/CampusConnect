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
import Link from "next/link";
import { Home, User, Lightbulb, GraduationCap, Code, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { collectionGroup, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";


export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<{ fullName: string, email: string, profilePhotoURL?: string } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        // A collectionGroup query is the right tool to find a user's document
        // without knowing their specific collegeId beforehand.
        const usersCollectionGroup = collectionGroup(db, 'users');
        const q = query(usersCollectionGroup, where("id", "==", user.uid), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserProfile({
                    fullName: `${data.firstName} ${data.lastName || ''}`.trim(),
                    email: data.emailPrimary,
                    profilePhotoURL: data.profilePhotoURL
                });
            }
        } else {
            console.log("User document not found in any college's users subcollection.");
        }
      }
    };
    
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchUserData();
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/partner-finder", icon: Lightbulb, label: "Partner Finder" },
    { href: "/alumni-projects", icon: GraduationCap, label: "Alumni Projects" },
    { href: "/code-editor", icon: Code, label: "Code Editor" },
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
            <Link href="/dashboard" className="flex items-center gap-2">
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
            </Link>
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
                        <AvatarImage src={userProfile?.profilePhotoURL || "https://placehold.co/40x40"} alt="User" />
                        <AvatarFallback>{userProfile?.fullName ? userProfile.fullName.charAt(0) : 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-sm truncate">{userProfile?.fullName || 'User Name'}</p>
                        <p className="text-xs text-muted-foreground truncate">{userProfile?.email || 'user@campus.edu'}</p>
                    </div>
                </Link>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={handleLogout}>
                    <LogOut className="h-5 w-5"/>
                </Button>
            </div>
        </SidebarFooter>
    </Sidebar>
  );
}
