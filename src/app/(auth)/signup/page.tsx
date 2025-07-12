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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// This would typically come from your database
const colleges = [
    { collegeID: "C001", name: "Innovate University", emailDomain: "innovate.edu.in" },
    { collegeID: "C002", name: "Tech Academy", emailDomain: "tech.edu.in" }
];

const signupFormSchema = z.object({
  role: z.enum(["user", "admin"], {
    required_error: "You need to select a role.",
  }),
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().optional(),
  usn: z.string().min(5, "USN must be at least 5 characters."),
  collegeID: z.string({ required_error: "Please select a college." }),
  branch: z.string({ required_error: "Please select a branch." }),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(20, "Password must be at most 20 characters."),
}).refine(data => {
    if (data.role === 'admin') {
        const selectedCollege = colleges.find(c => c.collegeID === data.collegeID);
        if (selectedCollege) {
            return data.email.endsWith(`@${selectedCollege.emailDomain}`);
        }
        return false;
    }
    return true;
}, {
    message: "Admins must use their official college email address.",
    path: ["email"],
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
        role: "user",
    }
  });

  const { formState: { isSubmitting } } = form;

  const handleSignup = async (values: SignupFormValues) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      const college = colleges.find(c => c.collegeID === values.collegeID);

      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        role: values.role,
        firstName: values.firstName,
        lastName: values.lastName || "",
        USN: values.usn,
        collegeName: college?.name,
        collegeID: values.collegeID,
        emailPrimary: values.email,
        emailPrimaryVerified: false,
        passwordHash: "", // Don't store password hash here for security reasons, Firebase Auth handles it.
        branch: values.branch,
        interests: [],
        profilePhotoURL: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
          title: "Account Created!",
          description: "Welcome to CampusConnect. Please log in.",
      });
      router.push('/login');
    } catch (error: any) {
        toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
        })
    }
  }

  return (
    <Card className="mx-auto max-w-lg w-full bg-card/50 backdrop-blur-sm">
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
                            onValueChange={field.onChange}
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
                        <FormLabel>College</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your college" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {colleges.map(college => (
                                <SelectItem key={college.collegeID} value={college.collegeID}>
                                {college.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
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
                         <FormDescription>
                           Admins must use their official college email.
                        </FormDescription>
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
                <Button type="submit" className="w-full button-glow" disabled={isSubmitting}>
                    {isSubmitting ? "Creating Account..." : "Create an account"}
                </Button>
            </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline text-primary">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
