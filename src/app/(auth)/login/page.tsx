
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, UserCredential } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { getUserByUsn, getUserByEmail } from '@/services/user';
import { useToast } from '@/hooks/use-toast';
import LoadingLink from '@/components/ui/loading-link';
import { cn } from '@/lib/utils';


export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'account-exists') {
      setError('An account with this email already exists. Please login.');
    }
  }, [searchParams]);

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

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setError(null);
    signInWithPopup(auth, googleProvider)
      .then(async (userCredential: UserCredential) => {
        const user = userCredential.user;
        if (!user.email) {
          throw new Error("Could not retrieve email from Google account.");
        }
        const campusUser = await getUserByEmail(user.email);
        if (!campusUser) {
           await auth.signOut();
           setError("No account found with this Google account. Please sign up first.");
           setIsLoading(false);
           return;
        }
        toast({
          title: "Welcome Back!",
          description: "You've been successfully logged in.",
        });
        router.push('/dashboard');
      })
      .catch((error: any) => {
        let errorMessage = "Failed to sign in with Google. Please try again.";
         if (error.code === 'auth/popup-blocked') {
            errorMessage = "Google Sign-In popup was blocked by the browser. Please allow popups for this site.";
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = "An account with this email already exists. Please sign in with your original method.";
        } else if (error.message !== "No account found with this Google account. Please sign up first.") {
           toast({
                title: "Google Sign-In Failed",
                description: errorMessage,
                variant: "destructive",
            });
        }
        setError(errorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

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
          <button className="social-button-new google" onClick={handleGoogleSignIn} disabled={isLoading}>
            <svg className="svg-new" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 488 512">
              <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
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
