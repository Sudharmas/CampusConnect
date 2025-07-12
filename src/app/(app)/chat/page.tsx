
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Shield, Lock, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const messages = [
    { id: 1, user: 'You', text: 'Hey! I saw your project post on the campus feed. I\'m really interested in the AI-powered mental health chatbot idea.', timestamp: '10:30 AM' },
    { id: 2, user: 'John Smith', text: 'That\'s great to hear! We\'re actively looking for collaborators. What\'s your background?', timestamp: '10:31 AM' },
    { id: 3, user: 'You', text: 'I\'m a final year Computer Science student specializing in NLP and have some experience with React.', timestamp: '10:32 AM' },
    { id: 4, user: 'John Smith', text: 'Perfect! That\'s exactly the skill set we need. Are you free for a quick call this week to discuss further?', timestamp: '10:33 AM' },
  ];

  return (
    <div className="container mx-auto h-full flex flex-col">
      <div className="mb-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Feed
          </Link>
        </Button>
      </div>

      <Card className="flex-grow flex flex-col bg-card/70 backdrop-blur-sm">
        <CardHeader className="border-b">
            <div className='flex items-center gap-4'>
                 <Avatar>
                    <AvatarImage src="https://placehold.co/40x40.png?text=JS" alt="John Smith" />
                    <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="font-headline text-xl text-glow">Chat with John Smith</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-green-400 mt-1">
                        <Lock className="h-3 w-3" /> This chat is end-to-end encrypted.
                    </CardDescription>
                </div>
            </div>
        </CardHeader>

        <CardContent className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-end gap-2 ${message.user === 'You' ? 'justify-end' : ''}`}>
              {message.user !== 'You' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://placehold.co/32x32.png?text=${message.user.charAt(0)}`} alt={message.user} />
                  <AvatarFallback>{message.user.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div className={`rounded-lg p-3 max-w-xs md:max-w-md ${message.user === 'You' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${message.user === 'You' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{message.timestamp}</p>
              </div>
               {message.user === 'You' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/32x32.png?text=Y" alt="You" />
                  <AvatarFallback>Y</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </CardContent>

        <CardFooter className="p-4 border-t flex flex-col items-start gap-4">
            <div className="w-full flex items-center gap-2">
                <Input placeholder="Type your message..." className="flex-grow bg-transparent" />
                <Button className="button-glow">
                    <Send className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-destructive/80">
                <Trash2 className="h-4 w-4" />
                <p>Messages will be permanently deleted when you close this chat.</p>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
