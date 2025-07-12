import { PartnerFinder } from '@/components/partner-finder';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PartnerFinderPage() {
  return (
    <div className="container mx-auto">
      <Card className="bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-glow">AI Partner Finder</CardTitle>
          <CardDescription>Describe your project, interests, or the skills you're looking for, and our AI will find the best matches for you on campus.</CardDescription>
        </CardHeader>
        <CardContent>
          <PartnerFinder />
        </CardContent>
      </Card>
    </div>
  );
}
