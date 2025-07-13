
'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import LoadingLink from '@/components/ui/loading-link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsEmailSent(true);
      toast({
        title: "Password Reset Email Sent",
        description: `If an account exists for ${email}, a password reset link has been sent. Please check your inbox.`,
      });
    } catch (error: any) {
        // We show a generic message for security to avoid user enumeration.
        setIsEmailSent(true); // Still show success UI to prevent sniffing for existing emails
        console.error("Password Reset Error:", error);
         toast({
            title: "Password Reset Email Sent",
            description: `If an account exists for ${email}, a password reset link has been sent. Please check your inbox.`,
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container-new">
      <div className="login-heading-new">Reset Password</div>

      {isEmailSent ? (
         <div className="text-center mt-6 text-foreground">
            <p>A password reset link has been sent to your email address if it is associated with an account.</p>
            <p className="mt-4">Please check your inbox (and spam folder).</p>
             <LoadingLink href="/login" className="flex items-center justify-center mt-6 text-sm text-primary hover:underline">
                 <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
            </LoadingLink>
         </div>
      ) : (
        <>
            <form onSubmit={handlePasswordReset} className="login-form-new">
                <p className='text-center text-sm text-muted-foreground'>Enter the email address associated with your account and we'll send you a link to reset your password.</p>
                <input
                required
                className={cn("input-new", error && "border-destructive animate-shake")}
                type="email"
                name="email"
                id="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                />
                
                {error && (
                    <p className="mt-2 text-sm text-center text-destructive animate-shake">{error}</p>
                )}

                <button className="submit-button-new" type="submit" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>

            <span className="signup-link-new">
                Remember your password? <LoadingLink href="/login">Login</LoadingLink>
            </span>
        </>
      )}
    </div>
  );
}
