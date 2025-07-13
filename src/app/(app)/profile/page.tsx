
'use client';

import { useState, useEffect } from 'react';
import { ProfileForm } from '@/components/profile-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserById, User } from '@/services/user';
import { auth } from '@/lib/firebase';
import LoadingSpinner from '@/components/loading-spinner';
import { Pencil } from 'lucide-react';
import LoadingLink from '@/components/ui/loading-link';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const fetchedUser = await getUserById(user.uid);
        setUserData(fetchedUser);
        // Check for a locally stored avatar
        const savedAvatar = localStorage.getItem(`avatar_${user.uid}`);
        if (savedAvatar) {
          setLocalAvatar(savedAvatar);
        }
      } else {
        setUserData(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const handleSave = () => {
    setIsEditing(false);
    // Optionally re-fetch data to confirm saves
    if(auth.currentUser) {
        getUserById(auth.currentUser.uid).then(setUserData);
    }
  }

  const handleEditToggle = () => setIsEditing(!isEditing);

  return (
    <div className="container mx-auto">
      <Card className="max-w-4xl mx-auto bg-card/70 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-3xl text-glow">Your Profile</CardTitle>
            <CardDescription>This is how others will see you on CampusConnect. Make it shine.</CardDescription>
          </div>
          {userData && !isEditing && (
            <Button variant="outline" onClick={handleEditToggle} className="button-glow">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <LoadingSpinner />
            </div>
          ) : userData ? (
            <ProfileForm 
              initialData={userData} 
              isEditing={isEditing} 
              onSave={handleSave} 
              onCancel={() => setIsEditing(false)}
              localAvatar={localAvatar}
              setLocalAvatar={setLocalAvatar}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
              <p className="text-muted-foreground">You must be logged in to view and edit your profile.</p>
              <Button asChild className="button-glow">
                <LoadingLink href="/login">Login Now</LoadingLink>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
