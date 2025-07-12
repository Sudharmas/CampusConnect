'use client';

import { useState, useEffect } from 'react';
import { ProfileForm } from '@/components/profile-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserById, User } from '@/services/user';
import { auth } from '@/lib/firebase';
import LoadingSpinner from '@/components/loading-spinner';
import { Pencil } from 'lucide-react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const fetchedUser = await getUserById(user.uid);
        setUserData(fetchedUser);
      } else {
        setUserData(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEditToggle = () => setIsEditing(!isEditing);

  return (
    <div className="container mx-auto">
      <Card className="max-w-4xl mx-auto bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-3xl text-glow">Your Profile</CardTitle>
            <CardDescription>This is how others will see you on CampusConnect. Make it shine.</CardDescription>
          </div>
          {!isEditing && (
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
              onSave={() => setIsEditing(false)} 
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <p>Please log in to view your profile.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
