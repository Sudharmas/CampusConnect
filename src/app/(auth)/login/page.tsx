'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { EyeOpenIcon } from '@/components/icons/eye-open';
import { EyeClosedIcon } from '@/components/icons/eye-closed';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('user@campus.edu');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      // Set a generic error message for security
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-sm w-full bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-glow">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className={cn(error && "border-destructive animate-shake")}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={cn("pr-10", error && "border-destructive animate-shake")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOpenIcon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <EyeClosedIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive animate-shake">{error}</p>
          )}

          <Button type="submit" className="w-full button-glow" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline text-primary">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
