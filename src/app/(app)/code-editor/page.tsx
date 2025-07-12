import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, Share2, PlusCircle } from "lucide-react";

export default function CodeEditorPage() {
  const codeSnippet = `import { connect } from 'campus-connect';

// Welcome to the collaborative editor!
// Invite your partners and start coding in real-time.

function main() {
  const project = new Project({
    name: "My Next Big Idea",
    collaborators: ["You", "Your_Partner_1"],
  });

  project.on('start', () => {
    console.log("Let's build something amazing! ✨");
  });

  project.start();
}

main();
`;

  return (
    <div className="h-full flex flex-col gap-4">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold font-headline text-glow">Collaborative Editor</h1>
            <div className="flex items-center gap-2">
                <Button variant="outline" className="button-glow">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                </Button>
                <Button className="button-glow bg-primary text-primary-foreground">
                    <Play className="mr-2 h-4 w-4" />
                    Run
                </Button>
            </div>
        </div>
        <Card className="flex-grow flex flex-col bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between p-2 border-b">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="bg-muted">index.js</Button>
                    <Button variant="ghost" size="sm">package.json</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><PlusCircle className="h-4 w-4 text-muted-foreground"/></Button>
                </div>
                <div className="flex items-center -space-x-2">
                    <Avatar className="h-8 w-8 border-2 border-background">
                        <AvatarImage src="https://placehold.co/32x32?text=U1" />
                        <AvatarFallback>U1</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-8 w-8 border-2 border-background">
                        <AvatarImage src="https://placehold.co/32x32?text=U2" />
                        <AvatarFallback>U2</AvatarFallback>
                    </Avatar>
                     <Avatar className="h-8 w-8 border-2 border-background bg-primary text-primary-foreground">
                        <AvatarFallback>+2</AvatarFallback>
                    </Avatar>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
                <Textarea 
                    defaultValue={codeSnippet}
                    className="h-full w-full resize-none border-0 rounded-none bg-transparent font-code text-base focus-visible:ring-0"
                />
            </CardContent>
        </Card>
    </div>
  );
}
