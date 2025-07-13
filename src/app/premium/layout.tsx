
"use client";

import AnimatedBackground from "@/components/ui/animated-background";
import { auth } from "@/lib/firebase";
import LoadingSpinner from "@/components/loading-spinner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import LoadingLink from "@/components/ui/loading-link";


export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            router.push("/login");
        }
        });

        return () => unsubscribe();
    }, [router]);

    if (isAuthenticated === null) {
        return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <AnimatedBackground variant="app" />
            <LoadingSpinner />
        </div>
        );
    }
    
    if (!isAuthenticated) {
        return null;
    }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <AnimatedBackground variant="app" />
       <div className="absolute top-6 left-6 z-10">
         <Button variant="outline" asChild>
           <LoadingLink href="/profile">
             <ArrowLeft className="mr-2 h-4 w-4" />
             Back to Profile
           </LoadingLink>
         </Button>
       </div>
        {children}
    </div>
  );
}
