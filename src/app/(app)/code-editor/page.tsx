
'use client';

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, Share2, PlusCircle, X, Terminal, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getUserById, User } from "@/services/user";
import { auth } from "@/lib/firebase";


interface File {
  name: string;
  content: string;
}

const initialFiles: File[] = [
    {
        name: "index.js",
        content: `// Welcome to the collaborative editor!
// Invite your partners and start coding in real-time.

function greet(name) {
  console.log("Hello, " + name + "! ✨");
}

greet("CampusConnect");
`
    },
    {
        name: "package.json",
        content: `{
  "name": "campus-connect-project",
  "version": "1.0.0",
  "description": "Our next big idea!"
}
`
    }
];

const mockUsers = [
    { id: 'user2', name: 'Alice Smith', avatar: 'https://placehold.co/32x32?text=AS' },
    { id: 'user3', name: 'Bob Johnson', avatar: 'https://placehold.co/32x32?text=BJ' },
    { id: 'user4', name: 'Charlie Brown', avatar: 'https://placehold.co/32x32?text=CB' },
];

export default function CodeEditorPage() {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [output, setOutput] = useState<string[]>([]);
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [collaborators, setCollaborators] = useState<typeof mockUsers>([]);
  const [invitedStatus, setInvitedStatus] = useState<Record<string, boolean>>({});
  
  const shareableLink = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if(user) {
            const campusUser = await getUserById(user.uid);
            setCurrentUser(campusUser);
        }
    });
    return () => unsubscribe();
  }, []);

  const activeFile = files[activeFileIndex];

  const handleFileContentChange = (content: string) => {
    const newFiles = [...files];
    newFiles[activeFileIndex].content = content;
    setFiles(newFiles);
  };
  
  const handleAddNewFile = () => {
    const newFileName = `file-${files.length + 1}.js`;
    setFiles([...files, { name: newFileName, content: `// ${newFileName}` }]);
    setActiveFileIndex(files.length);
  };

  const handleRunCode = () => {
    setOutput([]);
    const capturedLogs: string[] = [];
    const originalConsoleLog = console.log;

    console.log = (...args: any[]) => {
      capturedLogs.push(args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return '[Unserializable Object]';
          }
        }
        return String(arg);
      }).join(' '));
    };

    try {
      const func = new Function(activeFile.content);
      func();
    } catch (error: any) {
      capturedLogs.push(`Error: ${error.message}`);
    } finally {
      console.log = originalConsoleLog;
      setOutput(capturedLogs);
    }
  };

  const handleInvite = (userToInvite: typeof mockUsers[0]) => {
    setInvitedStatus(prev => ({ ...prev, [userToInvite.id]: true }));
    setCollaborators(prev => [...prev, userToInvite]);
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    toast({
        title: "Link Copied!",
        description: "The shareable link has been copied to your clipboard.",
    });
  }

  return (
    <div className="h-full flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold font-headline text-glow">Collaborative Editor</h1>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Dialog>
                    <DialogTrigger asChild>
                         <Button variant="outline" className="button-glow w-full sm:w-auto">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-lg">
                        <DialogHeader>
                            <DialogTitle>Share Project</DialogTitle>
                            <DialogDescription>
                                Invite others to collaborate on this project in real-time.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-x-2">
                            <div className="grid flex-1 gap-2">
                                <Label htmlFor="link" className="sr-only">Link</Label>
                                <Input id="link" defaultValue={shareableLink} readOnly />
                            </div>
                            <Button type="button" size="sm" className="px-3" onClick={handleCopyLink}>
                                <span className="sr-only">Copy</span>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-4 pt-4">
                            <Label>Invite from your connections</Label>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {mockUsers.map(user => (
                                    <div key={user.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{user.name}</span>
                                        </div>
                                        <Button 
                                            size="sm"
                                            variant={invitedStatus[user.id] ? "secondary" : "default"}
                                            onClick={() => handleInvite(user)}
                                            disabled={invitedStatus[user.id]}
                                        >
                                            {invitedStatus[user.id] ? "Invited" : "Invite"}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                
                <Button className="button-glow bg-primary text-primary-foreground w-full sm:w-auto" onClick={handleRunCode}>
                    <Play className="mr-2 h-4 w-4" />
                    Run
                </Button>
            </div>
        </div>
        <Card className="flex-grow flex flex-col bg-card/70 backdrop-blur-sm">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 border-b gap-2">
                <div className="flex items-center gap-1 overflow-x-auto">
                    {files.map((file, index) => (
                        <Button 
                            key={index} 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setActiveFileIndex(index)}
                            className={cn(
                                "flex-shrink-0",
                                activeFileIndex === index && "bg-muted"
                            )}
                        >
                            {file.name}
                        </Button>
                    ))}
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleAddNewFile}>
                        <PlusCircle className="h-4 w-4 text-muted-foreground"/>
                    </Button>
                </div>
                <div className="flex items-center -space-x-2 self-end sm:self-center">
                    {currentUser && (
                         <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={currentUser.profilePhotoURL || `https://placehold.co/32x32.png?text=${currentUser.firstName.charAt(0)}`} />
                            <AvatarFallback>{currentUser.firstName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                    {collaborators.map(user => (
                         <Avatar key={user.id} className="h-8 w-8 border-2 border-background">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
                <Textarea 
                    value={activeFile?.content || ""}
                    onChange={(e) => handleFileContentChange(e.target.value)}
                    className="h-full w-full resize-none border-0 rounded-none bg-transparent font-code text-base focus-visible:ring-0"
                />
            </CardContent>
            {output.length > 0 && (
                <CardFooter className="p-0 flex-col items-start border-t">
                    <div className="flex items-center gap-2 p-2 w-full">
                        <Terminal className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold">Output</h3>
                        <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => setOutput([])}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <pre className="w-full bg-muted/50 p-4 font-code text-sm overflow-x-auto">
                        <code>
                            {output.join('\n')}
                        </code>
                    </pre>
                </CardFooter>
            )}
        </Card>
    </div>
  );
}
