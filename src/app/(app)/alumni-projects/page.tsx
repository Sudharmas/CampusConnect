import { AlumniProjects } from '@/components/alumni-projects';

export default function AlumniProjectsPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold font-headline text-glow mb-2">Alumni-Student Collaborations</h1>
      <p className="text-muted-foreground mb-6">Discover exclusive projects posted by alumni. Gain experience, build your network, and contribute to impactful work.</p>
      <AlumniProjects />
    </div>
  );
}
