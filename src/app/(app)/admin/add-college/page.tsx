// This is a temporary admin page to add college data.
// You can visit /admin/add-college to use it.
'use client';

import { addCollege } from "@/services/college-admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { auth } from "@/lib/firebase";

export default function AddCollegePage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [collegeId, setCollegeId] = useState('4SN');
    const [collegeName, setCollegeName] = useState('Srinivas Institute of Technology');
    const [collegeDomain, setCollegeDomain] = useState('sitmng.ac.in');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const user = auth.currentUser;
        if (!user) {
            toast({
                title: "Authentication Error",
                description: "You must be logged in to add a college.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        try {
            await addCollege(collegeId, { name: collegeName, emailDomain: collegeDomain });
            toast({
                title: "College Added!",
                description: `${collegeName} has been successfully added to the database.`,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to add college.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto">
            <Card className="max-w-xl mx-auto bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl text-glow">Add College Details</CardTitle>
                    <CardDescription>Use this form to add a new college to the Firestore database.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="collegeId">College ID</Label>
                            <Input id="collegeId" value={collegeId} onChange={(e) => setCollegeId(e.target.value)} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="collegeName">College Name</Label>
                            <Input id="collegeName" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="collegeDomain">College Email Domain</Label>
                            <Input id="collegeDomain" value={collegeDomain} onChange={(e) => setCollegeDomain(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full button-glow" disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add College'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
