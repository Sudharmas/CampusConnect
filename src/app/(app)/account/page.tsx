
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { User as FirebaseUser, sendEmailVerification } from "firebase/auth";
import { updateUserOptionalEmail, deleteUserAccount, User, markEmailAsVerified, markOptionalEmailAsVerified, getUserById } from "@/services/user";
import { getCollegeById } from "@/services/college";
import LoadingSpinner from "@/components/loading-spinner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function AccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [campusUser, setCampusUser] = useState<User | null>(null);
  
  const [isEditingOptionalEmail, setIsEditingOptionalEmail] = useState(false);
  const [optionalEmailInput, setOptionalEmailInput] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  
  const deleteConfirmationText = `delete ${campusUser?.firstName || ""}`;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await user.reload(); 
        
        let updatedUser: User | null = null;
        try {
            updatedUser = await markEmailAsVerified(user.uid);
        } catch (error) {
            console.error("Permission error checking primary email verification, falling back:", error);
            updatedUser = await getUserById(user.uid);
        }

        setFirebaseUser(user);
        if (updatedUser) {
            setCampusUser(updatedUser);
            setOptionalEmailInput(updatedUser.emailOptional || "");
            setIsEditingOptionalEmail(!updatedUser.emailOptional);
        }
      } else {
        setFirebaseUser(null);
        setCampusUser(null);
        router.push("/login");
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router]);
  
  const handleSaveOptionalEmail = async () => {
    if (!firebaseUser || !campusUser) return;
    setIsSaving(true);
    
    let isVerified = false;
    let toastDescription = "Your optional email has been saved.";

    try {
        const college = await getCollegeById(campusUser.collegeID);
        if (college && optionalEmailInput.endsWith(`@${college.emailDomain}`)) {
            isVerified = true;
            toastDescription = "Your optional email has been saved and automatically verified.";
        }

        await updateUserOptionalEmail(firebaseUser.uid, optionalEmailInput, isVerified);
        
        setCampusUser(prev => prev ? { ...prev, emailOptional: optionalEmailInput, emailOptionalVerified: isVerified } : null);
        setIsEditingOptionalEmail(false);
        toast({
            title: "Optional Email Saved",
            description: toastDescription,
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

  const handleSendPrimaryVerificationLink = async () => {
    if (!firebaseUser) return;
    try {
      await sendEmailVerification(firebaseUser);
      toast({
        title: "Verification Link Sent",
        description: `A verification link has been sent to ${firebaseUser.email}. Please check your inbox.`
      })
    } catch (error: any) {
       toast({
        title: "Error Sending Link",
        description: error.message || "Failed to send verification link.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (!firebaseUser || deleteConfirmationInput !== deleteConfirmationText) return;
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

  const handleVerifyOptionalEmail = async () => {
    if (!firebaseUser) return;
    setIsVerifying(true);
    
    // Optimistic UI update
    setCampusUser(prev => prev ? { ...prev, emailOptionalVerified: true } : null);
    
    try {
      await markOptionalEmailAsVerified(firebaseUser.uid);
      toast({
        title: "Email Verified",
        description: "Your optional email has been marked as verified.",
      });
    } catch (error: any) {
       let errorMessage = "Failed to verify optional email.";
       if (error.code === 'permission-denied') {
          errorMessage = "Could not save to database. Check Firestore security rules.";
          toast({
            title: "Verification Saved Locally",
            description: "The verification status has been updated on this page, but we couldn't save it to the database. Please check your Firestore security rules.",
            variant: "default",
          });
       } else {
         toast({
            title: "Error",
            description: error.message || errorMessage,
            variant: "destructive",
         });
         // Revert optimistic update on failure
         setCampusUser(prev => prev ? { ...prev, emailOptionalVerified: false } : null);
       }
    } finally {
      setIsVerifying(false);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }
  
  if (!firebaseUser || !campusUser) {
    return <div className="flex justify-center items-center h-full"><p>User not found. Redirecting...</p></div>;
  }

  const primaryEmailVerified = firebaseUser.emailVerified && campusUser.emailPrimaryVerified;

  return (
    <div className="container mx-auto">
      <Card className="max-w-3xl mx-auto bg-card/70 backdrop-blur-sm">
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
                     {!primaryEmailVerified && (
                        <Button onClick={handleSendPrimaryVerificationLink}>Verify</Button>
                    )}
                </div>
                 <Badge variant={primaryEmailVerified ? "default" : "destructive"} className={primaryEmailVerified ? "bg-green-600/80" : ""}>
                    {primaryEmailVerified ? "Verified" : "Not Verified"}
                </Badge>
            </div>
            <div className="space-y-2">
                <Label htmlFor="optional-email">Optional Email</Label>
                {isEditingOptionalEmail ? (
                    <div className="flex items-center gap-4">
                        <Input 
                            id="optional-email-input" 
                            type="email" 
                            placeholder="Add a secondary email" 
                            value={optionalEmailInput}
                            onChange={(e) => setOptionalEmailInput(e.target.value)}
                        />
                        <Button onClick={handleSaveOptionalEmail} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                        { campusUser.emailOptional && (
                            <Button variant="outline" onClick={() => {
                                setIsEditingOptionalEmail(false);
                                setOptionalEmailInput(campusUser.emailOptional || "");
                            }}>Cancel</Button>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Input id="optional-email-display" type="email" value={campusUser.emailOptional || "No optional email added"} disabled />
                        {campusUser.emailOptional && !campusUser.emailOptionalVerified && (
                          <Button onClick={handleVerifyOptionalEmail} disabled={isVerifying}>
                            {isVerifying ? "Verifying..." : "Verify"}
                          </Button>
                        )}
                        {campusUser.emailOptional && (
                          <Button variant="outline" onClick={() => setIsEditingOptionalEmail(true)}>Edit</Button>
                        )}
                        {!campusUser.emailOptional && (
                           <Button onClick={() => setIsEditingOptionalEmail(true)}>Add Email</Button>
                        )}
                    </div>
                )}
                 {campusUser.emailOptional && (
                     <Badge variant={campusUser.emailOptionalVerified ? "default" : "destructive"} className={campusUser.emailOptionalVerified ? "bg-green-600/80" : ""}>
                        {campusUser.emailOptionalVerified ? "Verified" : "Not Verified"}
                    </Badge>
                 )}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
             <h3 className="text-lg font-medium font-headline text-destructive">Danger Zone</h3>
             <Card className="border-destructive/50 bg-destructive/10">
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
                                This action cannot be undone. To confirm, please type{" "}
                                <strong className="text-foreground">{deleteConfirmationText}</strong> in the box below.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Input 
                                value={deleteConfirmationInput}
                                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                                placeholder={`Type '${deleteConfirmationText}' to confirm`}
                                className="mt-2"
                            />
                            <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeleteConfirmationInput("")}>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleDeleteAccount} 
                                className="bg-destructive hover:bg-destructive/90"
                                disabled={deleteConfirmationInput !== deleteConfirmationText}
                            >
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
