"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Heart, Share2, Image as ImageIcon, Video, FileText } from 'lucide-react';
import Image from "next/image";

const initialPosts = [
  {
    id: 1,
    author: 'Alice Johnson',
    avatar: 'https://placehold.co/40x40.png?text=AJ',
    handle: '@alicej',
    time: '2h ago',
    content: 'Just had a breakthrough on my thesis project! The future of quantum computing is looking bright. Anyone interested in a discussion on qubit stability?',
    image: 'https://placehold.co/600x400.png',
    dataAiHint: 'quantum computer',
    likes: 12,
    comments: 4,
  },
  {
    id: 2,
    author: 'Bob Williams',
    avatar: 'https://placehold.co/40x40.png?text=BW',
    handle: '@bobw',
    time: '5h ago',
    content: 'Looking for a frontend developer to join my hackathon team. We are building a mobile app to help students find study groups on campus. Tech stack: React Native & Firebase. #hackathon #reactnative',
    likes: 5,
    comments: 8,
  },
];

export function CampusFeed() {
  const [posts, setPosts] = useState(initialPosts);
  const [newPost, setNewPost] = useState('');

  const handlePost = () => {
    if (newPost.trim()) {
      const post = {
        id: posts.length + 1,
        author: 'User Name',
        avatar: 'https://placehold.co/40x40.png',
        handle: '@username',
        time: 'Just now',
        content: newPost,
        likes: 0,
        comments: 0,
      };
      setPosts([post, ...posts]);
      setNewPost('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-6 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <Textarea
            placeholder="What's on your mind? Share an update, idea, or project..."
            className="bg-background border-2 border-input focus:border-primary focus:ring-primary/50"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2 text-muted-foreground">
                <Button variant="ghost" size="icon"><ImageIcon className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><Video className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon"><FileText className="h-5 w-5" /></Button>
            </div>
            <Button className="button-glow" onClick={handlePost}>Post</Button>
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
              <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <MessageCircle className="h-5 w-5" /> {post.comments}
              </Button>
              <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <Heart className="h-5 w-5" /> {post.likes}
              </Button>
              <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <Share2 className="h-5 w-5" /> Share
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
