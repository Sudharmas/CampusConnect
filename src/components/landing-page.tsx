
'use client';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Users, BrainCircuit, Menu } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import AnimatedBackground from './ui/animated-background';
import LoadingLink from './ui/loading-link';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleExploreProjects = () => {
    if (user) {
      router.push('/alumni-projects');
    } else {
      router.push('/login');
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <AnimatedBackground />
      <header className="px-4 lg:px-6 h-14 flex items-center z-10">
        <LoadingLink href="#" className="flex items-center justify-center" prefetch={false}>
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
            className="h-6 w-6 text-primary text-glow"
          >
            <path d="M10.19 1.44a1 1 0 0 0-1.02.06l-4.5 3.22a1 1 0 0 0-.47.85v12.86a1 1 0 0 0 .47.85l4.5 3.22a1 1 0 0 0 1.02.06l11-7.86a1 1 0 0 0 0-1.8l-11-7.86Z" />
            <path d="m11 13-6 4.29" />
            <path d="m11 13-6-4.29" />
            <path d="M11 13v9" />
            <path d="M11 13 22 5" />
          </svg>
          <span className="ml-2 text-lg font-bold font-headline text-glow">CampusConnect</span>
        </LoadingLink>
        <nav className="ml-auto hidden md:flex gap-4 sm:gap-6 items-center">
          <LoadingLink href="#features" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Features
          </LoadingLink>
          <LoadingLink href="#alumni" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Alumni
          </LoadingLink>
          <LoadingLink href="/login" prefetch={false}>
             <div className="login-container-nav">
                <Button variant="outline" className="login-button-nav border-none shadow-none text-foreground">
                  Login
                </Button>
              </div>
          </LoadingLink>
          <LoadingLink href="/signup" prefetch={false} className="signup-button">
            <span className="signup-button-span">
              Sign Up
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </LoadingLink>
        </nav>
        <div className="ml-auto md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] bg-background/90 backdrop-blur-sm">
                    <SheetHeader>
                      <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                    </SheetHeader>
                    <nav className="grid gap-6 text-lg font-medium mt-12">
                         <SheetClose asChild>
                            <LoadingLink href="#features" className="hover:text-primary" prefetch={false}>
                                Features
                            </LoadingLink>
                        </SheetClose>
                         <SheetClose asChild>
                            <LoadingLink href="#alumni" className="hover:text-primary" prefetch={false}>
                                Alumni
                            </LoadingLink>
                        </SheetClose>
                        <SheetClose asChild>
                             <LoadingLink href="/login" prefetch={false} className="hover:text-primary">
                                Login
                             </LoadingLink>
                        </SheetClose>
                        <SheetClose asChild>
                            <LoadingLink href="/signup" prefetch={false} className="hover:text-primary">
                                Sign Up
                            </LoadingLink>
                        </SheetClose>
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative">
          <div className="container px-4 md:px-6 text-center relative">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none font-headline text-glow">
                Connect. Collaborate. Create.
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                The ultimate platform for students and alumni to build the future, together. Find partners, launch projects, and make your mark.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <LoadingLink
                  href="/signup"
                  prefetch={false}
                  className="signup-button text-lg w-full sm:w-auto"
                >
                  <span className="signup-button-span">
                    Get Started
                  </span>
                </LoadingLink>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-transparent">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl font-headline text-glow">
              Everything You Need to Innovate
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl text-center mt-4">
              Discover a suite of powerful tools designed for seamless collaboration and project development.
            </p>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3 lg:gap-12 mt-12">
              <Card className="bg-card/70 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline"><BrainCircuit className="text-primary text-glow"/> AI Partner Matching</CardTitle>
                  <CardDescription>Our intelligent algorithm connects you with the perfect collaborators based on your skills and interests.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-card/70 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline"><Code className="text-primary text-glow"/> Real-time Code Editor</CardTitle>
                  <CardDescription>Collaborate on code with a built-in, multi-user editor. Perfect for hackathons and group projects.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-card/70 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline"><Users className="text-primary text-glow"/> Campus & Alumni Network</CardTitle>
                  <CardDescription>Engage with a vibrant community of students and alumni. Share ideas, get feedback, and find inspiration.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section id="alumni" className="w-full py-12 md:py-24 lg:py-32 bg-transparent">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline text-glow">
                Bridge the Gap Between Campus and Career
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Alumni can post exclusive projects, offering students real-world experience and mentorship opportunities.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Button type="button" className="w-full button-glow" onClick={handleExploreProjects}>Explore Alumni Projects</Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t z-10 bg-background">
        <p className="text-xs text-muted-foreground">&copy; 2024 CampusConnect. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <LoadingLink href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </LoadingLink>
          <LoadingLink href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </LoadingLink>
        </nav>
      </footer>
    </div>
  );
}
