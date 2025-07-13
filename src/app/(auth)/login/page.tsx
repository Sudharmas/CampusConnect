
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, UserCredential, getRedirectResult, signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';
import { getUserByUsn, getUserByEmail } from '@/services/user';
import { useToast } from '@/hooks/use-toast';
import LoadingLink from '@/components/ui/loading-link';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/loading-spinner';
import { useIsMobile } from '@/hooks/use-mobile';


export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const processRedirectResult = async () => {
      try {
        const userCredential = await getRedirectResult(auth);
        if (userCredential) {
          // User successfully signed in via redirect.
          const user = userCredential.user;
          if (!user.email) {
            throw new Error("Could not retrieve email from social account.");
          }
          const campusUser = await getUserByEmail(user.email);
          if (!campusUser) {
             await auth.signOut();
             // Redirect to signup with pre-filled info
             const params = new URLSearchParams();
             params.set('error', 'no-account');
             params.set('email', user.email);
             if (user.displayName) params.set('name', user.displayName);
             router.push(`/signup?${params.toString()}`);
             return; // Stop further execution
          }
          toast({
            title: "Welcome Back!",
            description: "You've been successfully logged in.",
          });
          router.push('/dashboard');
        } else {
            // No redirect result, probably a normal page load
            setIsLoading(false);
        }
      } catch (error: any) {
        console.error("Redirect Sign-In Error:", error);
        if (error.code === 'auth/account-exists-with-different-credential') {
             router.push('/login?error=account-exists');
        } else {
            toast({
                title: "Sign-In Failed",
                description: "Failed to sign in. Please try again.",
                variant: "destructive",
            });
        }
        setIsLoading(false);
      }
    };

    processRedirectResult();
    
    const errorParam = searchParams.get('error');
    if (errorParam === 'account-exists') {
      setError('An account with this email already exists. Please login.');
      window.history.replaceState(null, '', '/login');
    }

  }, [router, toast, searchParams]);

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value.includes('@')) {
      setIdentifier(value.toUpperCase());
    } else {
      setIdentifier(value);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      let email = identifier;
      if (!identifier.includes('@')) {
          const usn = identifier.toUpperCase();
          const user = await getUserByUsn(usn);
          if (user) {
              email = user.emailPrimary;
          } else {
              throw new Error("User not found with this USN.");
          }
      }
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: typeof googleProvider | typeof githubProvider) => {
    setIsLoading(true);
    setError(null);

    if (isMobile) {
        await signInWithRedirect(auth, provider);
        return; // Redirect will happen, so no more code will execute here
    }

    try {
        const userCredential: UserCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;
        if (!user.email) {
          throw new Error("Could not retrieve email from social account.");
        }
        const campusUser = await getUserByEmail(user.email);
        if (!campusUser) {
           await auth.signOut();
           const params = new URLSearchParams();
           params.set('error', 'no-account');
           params.set('email', user.email);
           if (user.displayName) params.set('name', user.displayName);
           router.push(`/signup?${params.toString()}`);
           return;
        }
        toast({
          title: "Welcome Back!",
          description: "You've been successfully logged in.",
        });
        router.push('/dashboard');
    } catch (error: any) {
        console.error("Social Sign-In Error:", error);
        if (error.code === 'auth/account-exists-with-different-credential') {
            setError("An account with this email already exists. Please sign in with your original method.");
        } else if (error.code === 'auth/popup-blocked') {
            setError("Sign-In popup was blocked by the browser. Please allow popups for this site.");
        } else if (error.code === 'auth/popup-closed-by-user') {
            // Do nothing, user simply closed the window.
        } else if (error.message.includes("No account found")) {
            setError(error.message);
        } else {
           toast({
                title: "Sign-In Failed",
                description: `Failed to sign in with ${provider.providerId.split('.')[0]}. Please try again.`,
                variant: "destructive",
            });
        }
        setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="login-container-new">
      <div className="login-heading-new">Login</div>
      {error && (
        <p className="mt-4 text-sm text-center text-destructive animate-shake">{error}</p>
      )}
      <form onSubmit={handleLogin} className="login-form-new">
        <input
          required
          className={cn("input-new", error && "border-destructive animate-shake")}
          type="text"
          name="identifier"
          id="identifier"
          placeholder="Email or USN"
          value={identifier}
          onChange={handleIdentifierChange}
          disabled={isLoading}
        />
        <input
          required
          className={cn("input-new", error && "border-destructive animate-shake")}
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
        <span className="forgot-password-new">
            <LoadingLink href="/forgot-password">Forgot Password?</LoadingLink>
        </span>
        
        <button className="submit-button-new" type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="social-account-container-new">
        <span className="title-new">Or Sign in with</span>
        <div className="social-accounts-new">
          <button className="social-button-new google" onClick={() => handleSocialSignIn(googleProvider)} disabled={isLoading}>
            <svg className="svg-new" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 488 512">
              <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
            </svg>
          </button>
           <button className="social-button-new github" onClick={() => handleSocialSignIn(githubProvider)} disabled={isLoading}>
            <svg className="svg-new" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 496 512">
                <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3.3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-27.9-112.3-124.3 0-27.5 10.3-50.5 27.5-68.2-2.3-6.2-11.7-31.9 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 14.3 36 4.9 61.7 2.6 67.9 17.2 17.7 27.5 40.7 27.5 68.2 0 96.7-56.6 118.3-112.6 124.3 9.7 8.5 18.8 25.3 18.8 51.1 0 36.8-.3 66.2-.3 75.2 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
            </svg>
          </button>
        </div>
      </div>
      <span className="signup-link-new">
        Don't have an account? <LoadingLink href="/signup">Sign up</LoadingLink>
      </span>
    </div>
  );
}

    