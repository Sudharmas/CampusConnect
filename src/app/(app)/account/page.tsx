
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
import { getUserById, updateUserOptionalEmail, deleteUserAccount, User, verifyUserEmail, markEmailAsVerified } from "@/services/user";
import { sendOtp, verifyOtp } from "@/services/otp";
import LoadingSpinner from "@/components/loading-spinner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
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
  
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [emailToVerify, setEmailToVerify] = useState<string | null>(null);

  const deleteConfirmationText = `delete ${campusUser?.firstName || ""}`;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Always get a fresh copy of the user on initial load
        await user.reload(); 
        setFirebaseUser(user);
        const fetchedUser = await getUserById(user.uid);
        if (fetchedUser) {
            // Sync our DB with the auth state if needed
            if (user.emailVerified && !fetchedUser.emailPrimaryVerified) {
                await markEmailAsVerified(user.uid);
                const updatedUser = await getUserById(user.uid);
                setCampusUser(updatedUser);
            } else {
                setCampusUser(fetchedUser);
            }
            setOptionalEmailInput(fetchedUser.emailOptional || "");
            setIsEditingOptionalEmail(!fetchedUser.emailOptional);
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
  
  const handleRefreshUser = async () => {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      const freshFirebaseUser = auth.currentUser; // get the reloaded user object
      setFirebaseUser(freshFirebaseUser); 

      if (freshFirebaseUser?.emailVerified) {
         const updatedCampusUser = await markEmailAsVerified(user.uid);
         if (updatedCampusUser) {
           setCampusUser(updatedCampusUser);
           toast({ title: "Success", description: "Your primary email has been verified." });
         }
      } else {
        toast({ title: "Not Verified", description: "Your primary email is still not verified. Please check your inbox for the verification link." });
      }
    }
  }

  const handleSendVerificationLink = async () => {
    if (!firebaseUser) return;
    try {
      await sendEmailVerification(firebaseUser);
      toast({
        title: "Verification Email Sent",
        description: `A verification link has been sent to ${firebaseUser.email}. Please check your inbox and click the link to verify. Then, click 'Refresh Status'.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email.",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveOptionalEmail = async () => {
    if (!firebaseUser) return;
    setIsSaving(true);
    try {
        await updateUserOptionalEmail(firebaseUser.uid, optionalEmailInput);
        setCampusUser(prev => prev ? { ...prev, emailOptional: optionalEmailInput, emailOptionalVerified: false } : null);
        setIsEditingOptionalEmail(false);
        toast({
            title: "Optional Email Saved",
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

  const handleSendOtp = async () => {
    if (!campusUser || !campusUser.emailOptional) return;
    try {
      const otp = await sendOtp(campusUser.emailOptional, campusUser.role);
      setEmailToVerify(campusUser.emailOptional);
      setIsOtpDialogOpen(true);
      
      const toastDescription = `An OTP has been sent to ${campusUser.emailOptional}. (Hint for testing: ${otp})`;

      toast({
        title: "OTP Sent (Simulation)",
        description: toastDescription
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP.",
        variant: "destructive"
      });
    }
  };

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
  
  const handleVerifyOtp = async () => {
    if (!firebaseUser || !emailToVerify) return;
    
    const isCorrect = await verifyOtp(emailToVerify, otpInput);

    if (isCorrect) {
        try {
            await verifyUserEmail(firebaseUser.uid, 'optional');
            setCampusUser(prev => prev ? { ...prev, emailOptionalVerified: true } : null);
            toast({ title: "Success!", description: `${emailToVerify} has been verified.` });
        } catch (error) {
            toast({ title: "Error", description: "Could not update verification status in database.", variant: "destructive" });
        }
    } else {
        toast({ title: "Invalid OTP", description: "The OTP you entered is incorrect.", variant: "destructive" });
    }
    setOtpInput("");
    setIsOtpDialogOpen(false);
  }

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
                    {!primaryEmailVerified ? (
                        <>
                          <Button variant="outline" onClick={handleSendVerificationLink}>Send Link</Button>
                          <Button variant="ghost" onClick={handleRefreshUser}>Refresh Status</Button>
                        </>
                    ) : null}
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
                        <Button variant="outline" onClick={() => setIsEditingOptionalEmail(false)}>Cancel</Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Input id="optional-email-display" type="email" value={campusUser.emailOptional || ""} disabled />
                        {campusUser.emailOptional && (
                          <>
                            <Button variant="outline" onClick={() => setIsEditingOptionalEmail(true)}>Edit</Button>
                            {!campusUser.emailOptionalVerified && (
                                <Button onClick={handleSendOtp}>Verify</Button>
                            )}
                          </>
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

      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Verify Your Email</DialogTitle>
                  <DialogDescription>
                      An OTP has been sent to {emailToVerify}. Please enter it below.
                      The code is valid for 15 minutes.
                  </DialogDescription>
              </DialogHeader>
              <Input
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                maxLength={6}
                placeholder="Enter 6-digit OTP"
              />
              <DialogFooter>
                  <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleVerifyOtp}>Verify</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
