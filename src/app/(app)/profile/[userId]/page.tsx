
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getUserById, User } from '@/services/user';
import LoadingSpinner from '@/components/loading-spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import LoadingLink from '@/components/ui/loading-link';
import { ArrowLeft } from 'lucide-react';

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setIsLoading(true);
      const fetchedUser = await getUserById(params.userId);
      setUserData(fetchedUser);
      setIsLoading(false);
    }
    if (params.userId) {
      fetchUser();
    }
  }, [params.userId]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-muted-foreground">User not found.</p>
        <Button variant="link" asChild>
            <LoadingLink href="/dashboard">Go back to dashboard</LoadingLink>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
        <div className="mb-4">
            <Button variant="ghost" asChild>
            <LoadingLink href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </LoadingLink>
            </Button>
      </div>
      <Card className="mx-auto max-w-4xl bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={userData.profilePhotoURL} alt={`${userData.firstName}'s avatar`} />
              <AvatarFallback className="text-3xl">
                {userData.firstName?.charAt(0)}
                {userData.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-headline text-4xl text-glow">{userData.firstName} {userData.lastName}</CardTitle>
              <CardDescription>{userData.collegeName}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="mt-6 space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-primary">Bio</h3>
            <p className="mt-2 text-muted-foreground">{userData.bio || 'No bio provided.'}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-primary">Skills</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {userData.skills && userData.skills.length > 0 ? (
                userData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No skills listed.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-primary">Interests</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {userData.interests && userData.interests.length > 0 ? (
                userData.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">{interest}</Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No interests listed.</p>
              )}
            </div>
          </div>
          
           <div className="pt-4">
             <Button className="w-full button-glow">Send Connection Request</Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
