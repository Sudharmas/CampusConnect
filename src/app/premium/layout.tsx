
"use client";

import AnimatedBackground from "@/components/ui/animated-background";
import { auth } from "@/lib/firebase";
import LoadingSpinner from "@/components/loading-spinner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

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
        {children}
    </div>
  );
}
