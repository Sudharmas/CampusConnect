
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Zap } from "lucide-react";
import LoadingLink from "./ui/loading-link";

const projects = [
  {
    alumnusId: "alumnus-jane-doe",
    title: "Eco-Friendly Drone Delivery System",
    alumnus: "Jane Doe, '18",
    company: "Innovate Inc.",
    description: "Developing a sustainable drone delivery service for urban areas. We're seeking students with experience in robotics, logistics software, and sustainable energy.",
    skills: ["Robotics", "Python", "Logistics", "AI", "CAD"],
    status: "Actively Recruiting"
  },
  {
    alumnusId: "alumnus-john-smith",
    title: "AI-Powered Mental Health Chatbot",
    alumnus: "John Smith, '20",
    company: "MindWell AI",
    description: "Build and train a compassionate chatbot to provide accessible mental health support. Looking for NLP enthusiasts, psychologists, and full-stack developers.",
    skills: ["NLP", "Machine Learning", "React", "Node.js", "Psychology"],
    status: "Actively Recruiting"
  },
  {
    alumnusId: "alumnus-emily-white",
    title: "Blockchain for Secure Voting",
    alumnus: "Emily White, '15",
    company: "Veritas Chain",
    description: "A research project exploring the viability of blockchain technology for creating secure and transparent digital voting systems. Cryptography and security skills are a plus.",
    skills: ["Blockchain", "Cryptography", "Go", "Security"],
    status: "Reviewing Applicants"
  },
   {
    alumnusId: "alumnus-michael-brown",
    title: "AR History Tour of Campus",
    alumnus: "Michael Brown, '22",
    company: "Campus Ventures",
    description: "Create an augmented reality mobile app that brings campus history to life. We need Unity developers, 3D artists, and history buffs.",
    skills: ["Augmented Reality", "Unity", "C#", "3D Modeling", "History"],
    status: "Actively Recruiting"
  }
];

export function AlumniProjects() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {projects.map((project, index) => (
        <Card key={index} className="bg-card/70 backdrop-blur-sm flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="font-headline text-xl text-primary">{project.title}</CardTitle>
              <Badge variant={project.status === "Actively Recruiting" ? "default" : "secondary"} className={project.status === "Actively Recruiting" ? "bg-accent text-accent-foreground" : ""}>
                {project.status === "Actively Recruiting" && <Zap className="mr-1 h-3 w-3" />}
                {project.status}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-2 pt-1"><Briefcase className="h-4 w-4"/> {project.alumnus} @ {project.company}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground mb-4">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill) => (
                <Badge key={skill} variant="outline">{skill}</Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full button-glow" asChild>
                <LoadingLink href={`/chat?userId=${project.alumnusId}&name=${encodeURIComponent(project.alumnus.split(',')[0])}`}>
                    Express Interest
                </LoadingLink>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
