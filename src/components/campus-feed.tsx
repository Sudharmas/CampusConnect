
"use client";
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageIcon, Music, Video, X, Heart, MessageSquare } from 'lucide-react';
import Image from "next/image";
import { useToast } from '@/hooks/use-toast';
import { addConnection, getUserById, User } from '@/services/user';
import { auth } from '@/lib/firebase';
import LoadingLink from '@/components/ui/loading-link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from './ui/separator';

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
    comments: [
      { user: 'Bob', text: 'Sounds fascinating!' },
      { user: 'Charlie', text: 'I\'d love to hear more.' },
    ],
    views: 152,
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
    comments: [],
    views: 210,
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
    comments: [
       { user: 'Alice', text: 'Congratulations! That\'s amazing news.' },
    ],
    views: 430,
    isProject: false,
  },
];

type Post = typeof initialPosts[0];
type Comment = { user: string; text: string };

const PostCard = ({ post, onConnect }: { post: Post, onConnect: (authorId: string, authorName: string) => void }) => {
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [newComment, setNewComment] = useState("");
  const commentInputRef = useRef<HTMLInputElement>(null);
  
  const handleLike = () => {
    setLikes(prev => prev + 1);
  };
  
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments(prev => [...prev, { user: "You", text: newComment }]);
      setNewComment("");
    }
  };
  
  return (
    <div className="feed-post-main relative">
      <div className="feed-post-card_back"></div>
      <div className="feed-post-card">
        <div className="fl">
          <Dialog>
            <DialogTrigger asChild>
              <button className="fullscreen">
                <svg className="fullscreen_svg" viewBox="0 0 100 100"><path d="M3.563-.004a3.573 3.573 0 0 0-3.527 4.09l-.004-.02v28.141c0 1.973 1.602 3.57 3.57 3.57s3.57-1.598 3.57-3.57V12.218v.004l22.461 22.461a3.571 3.571 0 0 0 6.093-2.527c0-.988-.398-1.879-1.047-2.523L12.218 7.172h19.989c1.973 0 3.57-1.602 3.57-3.57s-1.598-3.57-3.57-3.57H4.035a3.008 3.008 0 0 0-.473-.035zM96.333 0l-.398.035.02-.004h-28.16a3.569 3.569 0 0 0-3.57 3.57 3.569 3.569 0 0 0 3.57 3.57h19.989L65.323 29.632a3.555 3.555 0 0 0-1.047 2.523 3.571 3.571 0 0 0 6.093 2.527L92.83 12.221v19.985a3.569 3.569 0 0 0 3.57 3.57 3.569 3.569 0 0 0 3.57-3.57V4.034v.004a3.569 3.569 0 0 0-3.539-4.043l-.105.004zM3.548 64.23A3.573 3.573 0 0 0 .029 67.8v28.626-.004l.016.305-.004-.016.004.059v-.012l.039.289-.004-.023.023.121-.004-.023c.074.348.191.656.34.938l-.008-.02.055.098-.008-.02.148.242-.008-.012.055.082-.008-.012c.199.285.43.531.688.742l.008.008.031.027.004.004c.582.461 1.32.742 2.121.762h.004l.078.004h28.61a3.569 3.569 0 0 0 3.57-3.57 3.569 3.569 0 0 0-3.57-3.57H12.224l22.461-22.461a3.569 3.569 0 0 0-2.492-6.125l-.105.004h.008a3.562 3.562 0 0 0-2.453 1.074L7.182 87.778V67.793a3.571 3.571 0 0 0-3.57-3.57h-.055.004zm92.805 0a3.573 3.573 0 0 0-3.519 3.57v19.993-.004L70.373 65.328a3.553 3.553 0 0 0-2.559-1.082h-.004a3.573 3.573 0 0 0-3.566 3.57c0 1.004.414 1.91 1.082 2.555l22.461 22.461H67.802a3.57 3.57 0 1 0 0 7.14h28.606c.375 0 .742-.059 1.082-.168l-.023.008.027-.012-.02.008.352-.129-.023.008.039-.02-.02.008.32-.156-.02.008.023-.016-.008.008c.184-.102.34-.207.488-.32l-.008.008.137-.113-.008.004.223-.211.008-.008c.156-.164.301-.34.422-.535l.008-.016-.008.016.008-.02.164-.285.008-.02-.008.016.008-.02c.098-.188.184-.406.246-.633l.008-.023-.004.008.008-.023a3.44 3.44 0 0 0 .121-.852v-.004l.004-.078V67.804a3.569 3.569 0 0 0-3.57-3.57h-.055.004z"></path></svg>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-card/80 backdrop-blur-lg">
              <DialogHeader>
                <DialogTitle>Post by {post.author}</DialogTitle>
              </DialogHeader>
              <div className="mt-4 max-h-[70vh] overflow-y-auto">
                 <p className="whitespace-pre-wrap">{post.content}</p>
                  {post.image && (
                    <div className="mt-4">
                      <Image src={post.image} width={800} height={600} alt="Post image" data-ai-hint={post.dataAiHint} className="rounded-lg object-contain w-full h-auto"/>
                    </div>
                  )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="feed-post-data">
           <div className="feed-post-author">
              <div className="img">
                  <Image src={post.avatar} width={40} height={40} alt={post.author} />
              </div>
              <div className="text">
                <div className="text_m">{post.author}</div>
                <div className="text_s">{post.handle} &middot; {post.time}</div>
              </div>
            </div>

            <div className='feed-post-content'>
              <p>{post.content}</p>
              {post.image && (
                 <Image src={post.image} width={600} height={400} alt="Post image" data-ai-hint={post.dataAiHint} />
              )}
            </div>
            
            <div className="feed-post-card_content">
                {post.isProject ? (
                    <LoadingLink href="/chat" className='w-full'>
                        <button className="feed-post-action-button">Collaborate!</button>
                    </LoadingLink>
                ) : (
                    <div className="flex w-full justify-between items-center">
                        <button className="feed-post-action-button connect" onClick={() => onConnect(post.authorId, post.author)} />
                        <button className="feed-post-action-button share" />
                    </div>
                )}
            </div>
        </div>

        <div className="feed-post-btns">
          <button className="feed-post-stat likes" onClick={handleLike}>
            <Heart className="feed-post-stat-svg" />
            <span className="feed-post-stat-text">{likes}</span>
          </button>
          <Dialog>
            <DialogTrigger asChild>
              <button className="feed-post-stat comments">
                <MessageSquare className="feed-post-stat-svg"/>
                <span className="feed-post-stat-text">{comments.length}</span>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-card/80 backdrop-blur-lg">
              <DialogHeader>
                <DialogTitle>Comments</DialogTitle>
                <DialogDescription>
                  Comments on {post.author}'s post.
                </DialogDescription>
              </DialogHeader>
              <Separator />
              <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto">
                {comments.length > 0 ? comments.map((comment, index) => (
                  <div key={index} className="flex gap-2 text-sm">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{comment.user}</p>
                      <p className="text-muted-foreground">{comment.text}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No comments yet.</p>
                )}
              </div>
              <Separator />
              <DialogFooter>
                <form onSubmit={handleAddComment} className="w-full flex gap-2">
                  <Input 
                    ref={commentInputRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1"
                  />
                  <Button type="submit">Comment</Button>
                </form>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};


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

    const post: Post = {
        id: Date.now(),
        authorId: auth.currentUser?.uid || "user1",
        author: authorName,
        avatar: currentUser?.profilePhotoURL || 'https://placehold.co/40x40.png',
        handle: authorHandle,
        time: 'Just now',
        content: newPost,
        image: filePreview || undefined,
        dataAiHint: '',
        likes: 0,
        comments: [],
        views: 0,
        isProject: false,
    };

    setPosts([post, ...posts]);
    setNewPost('');
    removeFile();

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
    <div className="max-w-xl mx-auto">
      {currentUser && (
        <Card className="mb-8 bg-card/70 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={currentUser.profilePhotoURL || `https://placehold.co/40x40.png?text=${currentUser.firstName.charAt(0)}`} />
                        <AvatarFallback>{currentUser.firstName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p>Create a new post</p>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Textarea
                placeholder="What's on your mind? Share an update, idea, or project..."
                className="bg-transparent border-2 border-input focus:border-primary focus:ring-primary/50"
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
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
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
      )}
      <div className="space-y-12">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onConnect={handleConnect} />
        ))}
      </div>
    </div>
  );
}
