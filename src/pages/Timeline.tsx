import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { timelineAPI } from '@/services/api';
import { Heart, MessageCircle, Share2, Send, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Post {
  id: string;
  user_id: string;
  username: string;
  avatar?: string;
  content: string;
  image?: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  created_at: string;
  comments: Comment[];
}

interface Comment {
  id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
}

const Timeline: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await timelineAPI.getPosts();
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      // Mock data for demo
      setPosts([
        {
          id: '1',
          user_id: 'user1',
          username: 'stellar_dev',
          content: 'Acabei de completar minha primeira missão no Connectus! 🚀 A experiência gamificada está incrível!',
          likes_count: 12,
          comments_count: 3,
          is_liked: false,
          created_at: new Date().toISOString(),
          comments: []
        },
        {
          id: '2',
          user_id: 'user2',
          username: 'web3_explorer',
          content: 'Alguém mais está empolgado com as novas funcionalidades de DeFi no Connectus? O futuro chegou! 🌟',
          likes_count: 8,
          comments_count: 1,
          is_liked: true,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          comments: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setIsPosting(true);
    try {
      await timelineAPI.createPost({ content: newPost });
      setNewPost('');
      toast({
        title: "Post criado!",
        description: "Seu post foi publicado na timeline.",
      });
      loadPosts();
    } catch (error) {
      toast({
        title: "Erro ao criar post",
        description: "Não foi possível publicar o post.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await timelineAPI.likePost(postId);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked: !post.is_liked,
              likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
            }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId: string) => {
    const content = commentTexts[postId];
    if (!content?.trim()) return;

    try {
      await timelineAPI.commentPost(postId, content);
      setCommentTexts({ ...commentTexts, [postId]: '' });
      toast({
        title: "Comentário enviado!",
        description: "Seu comentário foi publicado.",
      });
      loadPosts();
    } catch (error) {
      toast({
        title: "Erro ao comentar",
        description: "Não foi possível enviar o comentário.",
        variant: "destructive",
      });
    }
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="animate-pulse space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4">
      <div className="container mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Timeline
          </h1>
          <p className="text-muted-foreground">
            Compartilhe momentos e conecte-se com a comunidade
          </p>
        </div>

        {/* Create Post */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 border-2 border-primary/30">
                <AvatarImage src={user?.avatar} alt={user?.nickname} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  {user?.nickname?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user?.nickname}</p>
                <Badge variant="outline" className="text-xs">
                  {user?.xp} XP
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <Textarea
                placeholder="O que está acontecendo?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="bg-background/50 border-border/50 min-h-[100px] resize-none"
              />
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" type="button">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Imagem
                </Button>
                <Button
                  type="submit"
                  disabled={isPosting || !newPost.trim()}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {isPosting ? 'Publicando...' : 'Publicar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="bg-gradient-to-br from-card to-card/50 border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 border-2 border-primary/30">
                      <AvatarImage src={post.avatar} alt={post.username} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {post.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{post.username}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTimeAgo(post.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground leading-relaxed">{post.content}</p>
                
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post image"
                    className="rounded-lg max-w-full h-auto border border-border/50"
                  />
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`hover:bg-red-500/10 ${
                        post.is_liked ? 'text-red-500' : 'text-muted-foreground'
                      }`}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${post.is_liked ? 'fill-current' : ''}`} />
                      {post.likes_count}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleComments(post.id)}
                      className="hover:bg-primary/10 text-muted-foreground hover:text-primary"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.comments_count}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-accent/10 text-muted-foreground hover:text-accent"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Comments Section */}
                {expandedComments.has(post.id) && (
                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Escreva um comentário..."
                        value={commentTexts[post.id] || ''}
                        onChange={(e) => setCommentTexts({
                          ...commentTexts,
                          [post.id]: e.target.value
                        })}
                        className="bg-background/50 border-border/50 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleComment(post.id)}
                        disabled={!commentTexts[post.id]?.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-xl font-semibold text-muted-foreground">Timeline vazia</p>
              <p className="text-muted-foreground">Seja o primeiro a publicar algo!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;