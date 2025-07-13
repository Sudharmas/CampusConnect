
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, UserCredential } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { getCollegeById, College } from '@/services/college';
import { createUser, checkIfUserExists, getUserByEmail } from '@/services/user';
import LoadingLink from '@/components/ui/loading-link';

const signupFormSchema = z.object({
  role: z.enum(["user", "admin"], {
    required_error: "You need to select a role.",
  }),
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().optional(),
  usn: z.string().min(5, "USN must be at least 5 characters.").transform(v => v.toUpperCase()),
  collegeID: z.string().min(1, "Please enter a college ID."),
  branch: z.string({ required_error: "Please select a branch." }),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(20, "Password must be at most 20 characters."),
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [college, setCollege] = useState<College | null>(null);
  const [isFetchingCollege, setIsFetchingCollege] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: async (data, context, options) => {
      // For Google Sign In, we don't need password validation
      const schema = data.password ? signupFormSchema : signupFormSchema.omit({ password: true });
      const result = await zodResolver(schema)(data, context, options);

      if (result.errors.collegeID || result.errors.email || result.errors.role) {
        return result;
      }

      const college = await getCollegeById(data.collegeID);
      if (!college) {
        return {
          values: {},
          errors: {
            ...result.errors,
            collegeID: { type: 'manual', message: 'College ID not found.' }
          }
        };
      }

      if (data.role === 'admin' && !data.email.endsWith(`@${college.emailDomain}`)) {
         return {
          values: {},
          errors: {
            ...result.errors,
            email: { type: 'manual', message: 'Admins must use their official college email address.' }
          }
        };
      }
      
      return result;
    },
    defaultValues: {
        role: "user",
        firstName: "",
        lastName: "",
        usn: "",
        collegeID: "",
        branch: "",
        email: "",
        password: ""
    },
    mode: "onBlur"
  });

  const { formState: { isSubmitting }, watch, trigger, setError, clearErrors } = form;
  const collegeIDValue = watch('collegeID');

  const handleCollegeIdBlur = async () => {
      if (collegeIDValue) {
        setIsFetchingCollege(true);
        setCollege(null);
        const fetchedCollege = await getCollegeById(collegeIDValue);
        if (fetchedCollege) {
          setCollege(fetchedCollege);
          clearErrors("collegeID"); 
          if (form.getValues('role') === 'admin') {
            trigger("email");
          }
        } else {
          setError("collegeID", { type: "manual", message: "College with this ID not found."});
        }
        setIsFetchingCollege(false);
      }
  };


  const handleSignup = async (values: SignupFormValues) => {
    try {
      const { usnExists } = await checkIfUserExists(values.usn);
      if (usnExists) {
        toast({
          title: "User Already Exists",
          description: `An account with USN ${values.usn} already exists. Please login.`,
          variant: "destructive"
        });
        return;
      }

      const finalCollege = await getCollegeById(values.collegeID);
      if (!finalCollege) {
         toast({
            title: "Sign up failed",
            description: "Invalid College ID. Please check and try again.",
            variant: "destructive",
        });
        return;
      }

      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email === values.email) {
          // This is a Google Sign-In user completing their profile
          await createUser({
            id: currentUser.uid,
            role: values.role,
            firstName: values.firstName,
            lastName: values.lastName,
            USN: values.usn,
            collegeName: finalCollege.name,
            collegeID: values.collegeID,
            emailPrimary: values.email,
            branch: values.branch,
          });
      } else {
        // This is a standard email/password signup
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;
        
        await createUser({
          id: user.uid,
          role: values.role,
          firstName: values.firstName,
          lastName: values.lastName,
          USN: values.usn,
          collegeName: finalCollege.name, 
          collegeID: values.collegeID,
          emailPrimary: values.email,
          branch: values.branch,
        });

        await signInWithEmailAndPassword(auth, values.email, values.password);
      }

      toast({
          title: "Account Created!",
          description: "Welcome to CampusConnect! Redirecting you to the dashboard.",
      });
      router.push('/dashboard');
      
    } catch (error: any) {
        let errorMessage = "An unknown error occurred.";
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "This email is already in use by another account.";
        } else if (error.message) {
            errorMessage = error.message;
        }
        toast({
            title: "Sign up failed",
            description: errorMessage,
            variant: "destructive",
        })
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    try {
      const userCredential: UserCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      if (!user.email) {
          throw new Error("Could not retrieve email from Google account.");
      }

      // Check if user exists in Firestore
      const campusUser = await getUserByEmail(user.email);
      if (campusUser) {
          // User exists, log them in and redirect
          toast({
              title: "Welcome Back!",
              description: "You've been successfully logged in.",
          });
          router.push('/dashboard');
      } else {
          // New user, pre-fill form
          const [firstName, ...lastNameParts] = (user.displayName || "").split(" ");
          form.reset({
              ...form.getValues(),
              firstName: firstName,
              lastName: lastNameParts.join(" "),
              email: user.email,
              password: "" // Clear password field
          });
          toast({
              title: "Welcome!",
              description: "Please complete your profile details to finish signing up.",
          });
      }

    } catch (error: any) {
        let errorMessage = "Failed to sign in with Google. Please try again.";
        if (error.code === 'auth/account-exists-with-different-credential') {
            errorMessage = "An account with this email already exists using a different sign-in method.";
        }
        toast({
            title: "Google Sign-In Failed",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setIsGoogleSigningIn(false);
    }
  };

  return (
    <div className="signup-container">
        <div className="heading">Sign Up</div>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignup)} className="form">
            <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem className="input-group">
                    <FormLabel>I am a...</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          trigger("email");
                        }}
                        defaultValue={field.value}
                        className="flex space-x-4 pt-2"
                        >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="user" />
                            </FormControl>
                            <FormLabel className="font-normal">User</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                            <RadioGroupItem value="admin" />
                            </FormControl>
                            <FormLabel className="font-normal">Admin</FormLabel>
                        </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <Input placeholder="First Name" required {...field} className="input" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <Input placeholder="Last Name" {...field} className="input"/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <FormField
                control={form.control}
                name="usn"
                render={({ field }) => (
                    <FormItem>
                    <FormControl>
                        <Input placeholder="University Seat Number (USN)" required {...field} className="input" />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="collegeID"
                render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Input 
                                placeholder="College ID" 
                                required 
                                {...field} 
                                onBlur={handleCollegeIdBlur}
                                className="input"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {isFetchingCollege && <p className="text-sm text-muted-foreground text-center">Fetching college info...</p>}
            
            {college && (
                <div className="p-3 bg-muted rounded-2xl">
                    <p className="font-semibold text-foreground text-center">{college.name}</p>
                </div>
            )}

            <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                    <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger className="input">
                            <SelectValue placeholder="Select your branch" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                            <SelectItem value="Information Science">Information Science</SelectItem>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Mechanical">Mechanical</SelectItem>
                            <SelectItem value="Civil">Civil</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormControl>
                        <Input type="email" placeholder="E-mail" required {...field} className="input" disabled={!!auth.currentUser} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormControl>
                        <Input type="password" placeholder="Password" required {...field} className="input" disabled={!!auth.currentUser} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            
            <Button type="submit" className="signup-new-button" disabled={isSubmitting || isFetchingCollege || isGoogleSigningIn}>
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </Button>
            <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <LoadingLink href="/login" className="underline text-primary">
                    Login
                </LoadingLink>
            </div>
        </form>
        </Form>
        <div className="social-account-container">
            <span className="title">Or Sign up with</span>
            <div className="social-accounts">
                <button className="social-button google" onClick={handleGoogleSignIn} disabled={isGoogleSigningIn}>
                    <svg className="svg" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 488 512">
                    <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                </button>
                <button className="social-button github">
                    <svg className="svg" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 496 512">
                        <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3.3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-27.9-112.3-124.3 0-27.5 10.3-50.5 27.5-68.2-2.3-6.2-11.7-31.9 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 14.3 36 4.9 61.7 2.6 67.9 17.2 17.7 27.5 40.7 27.5 68.2 0 96.7-56.6 118.3-112.6 124.3 9.7 8.5 18.8 25.3 18.8 51.1 0 36.8-.3 66.2-.3 75.2 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
                    </svg>
                </button>
            </div>
        </div>
        <span className="agreement">Already have an account? <LoadingLink href="/login">Login</LoadingLink></span>
    </div>
  );
}
