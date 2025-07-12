import { ProfileForm } from '@/components/profile-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ProfilePage() {
  return (
    <div className="container mx-auto">
      <Card className="max-w-4xl mx-auto bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-glow">Your Profile</CardTitle>
          <CardDescription>This is how others will see you on CampusConnect. Make it shine.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
