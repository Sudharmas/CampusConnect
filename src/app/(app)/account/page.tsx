// This file is intentionally left blank. It will be created in a future step.
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { sendEmailVerification, User as FirebaseUser } from "firebase/auth";
import { getUserById, updateUserOptionalEmail, deleteUserAccount, User } from "@/services/user";
import LoadingSpinner from "@/components/loading-spinner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [campusUser, setCampusUser] = useState<User | null>(null);
  const [optionalEmail, setOptionalEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setFirebaseUser(user);
        const fetchedUser = await getUserById(user.uid);
        setCampusUser(fetchedUser);
        setOptionalEmail(fetchedUser?.emailOptional || "");
      } else {
        setFirebaseUser(null);
        setCampusUser(null);
        router.push("/login");
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSendVerificationEmail = async (user: FirebaseUser) => {
    try {
      await sendEmailVerification(user);
      toast({
        title: "Verification Email Sent",
        description: `A verification link has been sent to ${user.email}. Please check your inbox.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email.",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateOptionalEmail = async () => {
    if (!firebaseUser) return;
    setIsSaving(true);
    try {
        await updateUserOptionalEmail(firebaseUser.uid, optionalEmail);
        toast({
            title: "Optional Email Updated",
            description: "Your optional email has been saved.",
        });
    } catch (error: any) {
        toast({
            title: "Error",
            description: error.message || "Failed to update optional email.",
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!firebaseUser) return;
    setIsDeleting(true);
    try {
        await deleteUserAccount(firebaseUser.uid);
        await firebaseUser.delete();
        toast({
            title: "Account Deleted",
            description: "Your account and all associated data have been permanently deleted.",
        });
        router.push("/signup");
    } catch (error: any) {
        toast({
            title: "Error",
            description: error.message || "Failed to delete account. Please log out and log back in.",
            variant: "destructive",
        });
    } finally {
        setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }
  
  if (!firebaseUser || !campusUser) {
    return <div className="flex justify-center items-center h-full"><p>User not found. Redirecting...</p></div>;
  }

  return (
    <div className="container mx-auto">
      <Card className="max-w-3xl mx-auto bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-glow">Account Management</CardTitle>
          <CardDescription>Manage your email addresses and account settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium font-headline">Email Addresses</h3>
            <div className="space-y-2">
                <Label htmlFor="primary-email">Primary Email</Label>
                <div className="flex items-center gap-4">
                    <Input id="primary-email" type="email" value={campusUser.emailPrimary} disabled />
                    {!firebaseUser.emailVerified && (
                        <Button variant="outline" onClick={() => handleSendVerificationEmail(firebaseUser)}>Verify</Button>
                    )}
                </div>
                 {firebaseUser.emailVerified && <p className="text-sm text-green-400">Verified</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="optional-email">Optional Email</Label>
                <div className="flex items-center gap-4">
                    <Input 
                        id="optional-email" 
                        type="email" 
                        placeholder="Add a secondary email" 
                        value={optionalEmail}
                        onChange={(e) => setOptionalEmail(e.target.value)}
                    />
                    <Button onClick={handleUpdateOptionalEmail} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">Optional emails are not used for verification or login yet.</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
             <h3 className="text-lg font-medium font-headline text-destructive">Danger Zone</h3>
             <Card className="border-destructive/50">
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg text-destructive">Delete Account</CardTitle>
                        <CardDescription>Permanently delete your account and all of your content.</CardDescription>
                    </div>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isDeleting}>
                                {isDeleting ? "Deleting..." : "Delete Account"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                                Yes, delete my account
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardHeader>
             </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
