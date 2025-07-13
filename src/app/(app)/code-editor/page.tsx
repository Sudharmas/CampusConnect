
'use client';

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, Share2, PlusCircle, X, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function CodeEditorPage() {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [output, setOutput] = useState<string[]>([]);

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

    // Temporarily override console.log to capture output
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
      // Use new Function to safely execute the code in a local scope
      const func = new Function(activeFile.content);
      func();
    } catch (error: any) {
      capturedLogs.push(`Error: ${error.message}`);
    } finally {
      // Restore original console.log and set output
      console.log = originalConsoleLog;
      setOutput(capturedLogs);
    }
  };


  return (
    <div className="h-full flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold font-headline text-glow">Collaborative Editor</h1>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" className="button-glow w-full sm:w-auto">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                </Button>
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

