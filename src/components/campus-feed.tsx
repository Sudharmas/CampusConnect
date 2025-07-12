
"use client";
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Heart, Share2, ImageIcon, Video, Music, UserPlus, X } from 'lucide-react';
import Image from "next/image";
import { useToast } from '@/hooks/use-toast';
import { addConnection, getUserById, User } from '@/services/user';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

const initialPosts = [
  {
    id: 1,
    authorId: "user2",
    author: 'Alice Johnson',
    avatar: 'https://placehold.co/40x40.png?text=AJ',
    handle: '@alicej',
    time: '2h ago',
    content: 'Just had a breakthrough on my thesis project! The future of quantum computing is looking bright. Anyone interested in a discussion on qubit stability?',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'quantum computer',
    likes: 12,
    comments: 4,
    isProject: true,
  },
  {
    id: 2,
    authorId: "user3",
    author: 'Bob Williams',
    avatar: 'https://placehold.co/40x40.png?text=BW',
    handle: '@bobw',
    time: '5h ago',
    content: 'Looking for a frontend developer to join my hackathon team. We are building a mobile app to help students find study groups on campus. Tech stack: React Native & Firebase. #hackathon #reactnative',
    likes: 5,
    comments: 8,
    isProject: true,
  },
   {
    id: 3,
    authorId: "user4",
    author: 'Charlie Brown',
    avatar: 'https://placehold.co/40x40.png?text=CB',
    handle: '@charlieb',
    time: '8h ago',
    content: 'Excited to share that my research paper on sustainable urban planning has been published! Huge thanks to my collaborators.',
    likes: 25,
    comments: 10,
    isProject: false,
  },
];

export function CampusFeed() {
  const [posts, setPosts] = useState(initialPosts);
  const [newPost, setNewPost] = useState('');
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const fetchedUser = await getUserById(user.uid);
        setCurrentUser(fetchedUser);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        // Create a temporary local URL for the selected image
        const localUrl = URL.createObjectURL(file);
        setFilePreview(localUrl);
      } else {
        toast({
          title: "Unsupported File Type",
          description: "For now, only images are supported for local preview.",
          variant: "destructive"
        });
      }
    }
  };
  
  const removeFile = () => {
    // Revoke the old blob URL to free up memory
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setFilePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handlePost = async () => {
    if (!newPost.trim() && !filePreview) return;

    const authorName = currentUser ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : 'User';
    const authorHandle = currentUser ? `@${currentUser.firstName.toLowerCase()}` : '@user';

    // This is a local-only post for testing. It will not be saved to a database.
    const post = {
        id: Date.now(), // Use timestamp for unique key in local state
        authorId: auth.currentUser?.uid || "user1",
        author: authorName,
        avatar: 'https://placehold.co/40x40.png',
        handle: authorHandle,
        time: 'Just now',
        content: newPost,
        image: filePreview, // Use the local blob URL
        likes: 0,
        comments: 0,
        isProject: false,
    };

    setPosts([post, ...posts]);
    setNewPost('');
    
    // We don't revoke the URL here so the image stays visible in the feed
    setFilePreview(null); 
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }

    toast({
        title: "Post Created (Local)",
        description: "Your post has been added to the feed for this session.",
    });
  };

  const handleConnect = async (authorId: string, authorName: string) => {
    if (!auth.currentUser) {
        toast({ title: "Please log in", description: "You need to be logged in to connect with users.", variant: "destructive" });
        return;
    }
    try {
        await addConnection(auth.currentUser.uid, authorId);
        toast({
            title: "Connected!",
            description: `You are now connected with ${authorName}. They will be prioritized in your Partner Finder results.`,
        });
    } catch (error: any) {
        toast({
            title: "Error",
            description: error.message || "Failed to connect.",
            variant: "destructive",
        });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
      <Card className="mb-6 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <Textarea
            placeholder="What's on your mind? Share an update, idea, or project..."
            className="bg-background border-2 border-input focus:border-primary focus:ring-primary/50"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          {filePreview && (
              <div className="mt-4 relative">
                  <Image src={filePreview} width={600} height={400} alt="Preview" className="rounded-lg object-cover w-full h-auto" />
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={removeFile}>
                      <X className="h-4 w-4" />
                  </Button>
              </div>
          )}
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-1 text-muted-foreground">
                <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}><ImageIcon className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" onClick={() => toast({ title: "Coming Soon!", description: "Audio uploads will be available in a future update."})}><Music className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" onClick={() => toast({ title: "Coming Soon!", description: "Video uploads will be available in a future update."})}><Video className="h-5 w-5" /></Button>
            </div>
            <Button className="button-glow" onClick={handlePost}>
                Post
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-4 p-4">
              <Avatar>
                <AvatarImage src={post.avatar} alt={post.author} />
                <AvatarFallback>{post.author.substring(0,2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{post.author}</p>
                <p className="text-sm text-muted-foreground">{post.handle} · {post.time}</p>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-2">
              <p className="whitespace-pre-wrap">{post.content}</p>
              {post.image && (
                 <div className="mt-4 rounded-lg overflow-hidden border border-border">
                    <Image src={post.image} width={600} height={400} alt="Post image" data-ai-hint={post.dataAiHint} className="object-cover w-full h-auto" />
                 </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-around p-2">
                {post.isProject ? (
                    <>
                        <Link href="/chat" className='w-full'><Button variant="ghost" className="w-full flex items-center gap-2 text-muted-foreground hover:text-primary">Collaborate</Button></Link>
                        <Link href="/chat" className='w-full'><Button variant="ghost" className="w-full flex items-center gap-2 text-muted-foreground hover:text-primary">Source this Project</Button></Link>
                    </>
                ) : (
                    <>
                        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                            <MessageCircle className="h-5 w-5" /> {post.comments}
                        </Button>
                        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                            <Heart className="h-5 w-5" /> {post.likes}
                        </Button>
                        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary" onClick={() => handleConnect(post.authorId, post.author)}>
                            <UserPlus className="h-5 w-5" /> Connect
                        </Button>
                        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                            <Share2 className="h-5 w-5" /> Share
                        </Button>
                    </>
                )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
