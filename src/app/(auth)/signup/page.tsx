
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { getCollegeById, College } from '@/services/college';
import { createUser, checkIfUserExists } from '@/services/user';
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
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (shouldRedirect) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 2000); // Redirect after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [shouldRedirect, router]);

  const form = useForm<SignupFormValues>({
    resolver: async (data, context, options) => {
      const result = await zodResolver(signupFormSchema)(data, context, options);

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
          clearErrors("collegeID"); // Clear error on success
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
      // 1. Check if user with USN already exists
      const { usnExists } = await checkIfUserExists(values.usn);
      if (usnExists) {
        toast({
          title: "User Already Exists",
          description: `An account with USN ${values.usn} already exists. Please login.`,
          variant: "destructive"
        });
        return;
      }

      // Re-fetch college details on submit to be absolutely sure.
      const finalCollege = await getCollegeById(values.collegeID);
      if (!finalCollege) {
         toast({
            title: "Sign up failed",
            description: "Invalid College ID. Please check and try again.",
            variant: "destructive",
        });
        return;
      }
      
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

      // Sign in the user immediately after creating the account
      await signInWithEmailAndPassword(auth, values.email, values.password);

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
  }

  return (
    <Card className="mx-auto max-w-lg w-full bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-glow">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignup)} className="grid gap-4">
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>I am a...</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={(value) => {
                              field.onChange(value);
                              trigger("email");
                            }}
                            defaultValue={field.value}
                            className="flex space-x-4"
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
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Ada" required {...field} />
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
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Lovelace" {...field} />
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
                        <FormLabel>University Seat Number (USN)</FormLabel>
                        <FormControl>
                            <Input placeholder="1AB23CD001" required {...field} />
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
                            <FormLabel>College ID</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="Enter your College ID" 
                                    required 
                                    {...field} 
                                    onBlur={handleCollegeIdBlur}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {isFetchingCollege && <p className="text-sm text-muted-foreground">Fetching college info...</p>}
                
                {college && (
                    <div className="p-3 bg-muted rounded-md">
                        <p className="font-semibold text-foreground">{college.name}</p>
                    </div>
                )}
                
                 <FormField
                    control={form.control}
                    name="branch"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="m@example.com" required {...field} />
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" required {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full signup-button" disabled={isSubmitting || isFetchingCollege}>
                    <span className="signup-button-span">
                      {isSubmitting ? "Creating Account..." : "Create an account"}
                    </span>
                </Button>
            </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <LoadingLink href="/login" className="underline text-primary">
            Login
          </LoadingLink>
        </div>
      </CardContent>
    </Card>
  );
}
