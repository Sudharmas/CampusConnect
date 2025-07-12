import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="container mx-auto">
      <Card className="max-w-3xl mx-auto bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-glow">Settings</CardTitle>
          <CardDescription>Manage your account settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium font-headline">Notifications</h3>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails about new messages, project invites, and collaboration requests.
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
          </div>
          
          <Separator />
          
           <div className="space-y-4">
            <h3 className="text-lg font-medium font-headline">Account</h3>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="user@campus.edu" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="•••••••••••••" />
            </div>
          </div>
          
          <div className="flex justify-end">
             <Button className="button-glow">Save Changes</Button>
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}
