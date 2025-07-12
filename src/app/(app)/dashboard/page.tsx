import { CampusFeed } from '@/components/campus-feed';

export default function DashboardPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold font-headline text-glow mb-6">Campus Channel</h1>
      <CampusFeed />
    </div>
  );
}
