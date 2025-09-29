import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { chatAPI } from '@/services/api';
import { 
  Send, 
  Users, 
  MessageCircle, 
  Hash, 
  Shield,
  UserPlus,
  Settings,
  Search
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import io from 'socket.io-client';

interface Message {
  id: string;
  user_id: string;
  username: string;
  avatar?: string;
  content: string;
  timestamp: string;
  chat_type: 'public' | 'private';
  is_filtered?: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'public' | 'private';
  participants?: number;
  last_message?: Message;
  unread_count?: number;
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [socket, setSocket] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatRooms();
    initializeSocket();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    const newSocket = io('ws://127.0.0.1:8000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });

    newSocket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user_count', (count: number) => {
      setOnlineUsers(count);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    setSocket(newSocket);
  };

  const loadChatRooms = async () => {
    try {
      const response = await chatAPI.getChats();
      const rooms = response.data.rooms || [];
      
      setChatRooms(rooms);
      
      // Set default room to general chat
      const generalRoom = rooms.find((room: ChatRoom) => room.name === 'Geral') || rooms[0];
      if (generalRoom) {
        setCurrentRoom(generalRoom);
        loadMessages(generalRoom.id);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      
      // Mock data for demo
      const mockRooms: ChatRoom[] = [
        {
          id: 'general',
          name: 'Geral',
          type: 'public',
          participants: 89,
          unread_count: 0
        },
        {
          id: 'missions',
          name: 'Missões',
          type: 'public',
          participants: 45,
          unread_count: 2
        },
        {
          id: 'trading',
          name: 'Trading',
          type: 'public',
          participants: 67,
          unread_count: 0
        }
      ];
      
      setChatRooms(mockRooms);
      setCurrentRoom(mockRooms[0]);
      setOnlineUsers(89);
      
      // Mock messages
      setMessages([
        {
          id: '1',
          user_id: 'user1',
          username: 'stellar_dev',
          content: 'Olá pessoal! Bem-vindos ao chat do Connectus! 🚀',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          chat_type: 'public'
        },
        {
          id: '2',
          user_id: 'user2',
          username: 'web3_explorer',
          content: 'Oi! Estou animado para participar da comunidade!',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          chat_type: 'public'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const response = await chatAPI.getMessages(roomId);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !currentRoom) return;

    const tempMessage: Message = {
      id: Date.now().toString(),
      user_id: user?.id || '',
      username: user?.nickname || '',
      avatar: user?.avatar,
      content: messageText,
      timestamp: new Date().toISOString(),
      chat_type: currentRoom.type
    };

    setMessages(prev => [...prev, tempMessage]);
    setMessageText('');

    try {
      if (socket) {
        socket.emit('send_message', {
          content: messageText,
          chat_id: currentRoom.id
        });
      } else {
        await chatAPI.sendMessage({
          content: messageText,
          chat_id: currentRoom.id
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
      
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };

  const handleRoomChange = (room: ChatRoom) => {
    setCurrentRoom(room);
    loadMessages(room.id);
    
    // Mark room as read
    setChatRooms(prev => 
      prev.map(r => 
        r.id === room.id ? { ...r, unread_count: 0 } : r
      )
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Agora' : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-96">
              <div className="bg-muted rounded-lg"></div>
              <div className="lg:col-span-3 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Chat Global
            </h1>
            <p className="text-muted-foreground flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{onlineUsers} usuários online</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Sidebar - Chat Rooms */}
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hash className="w-5 h-5 text-primary" />
                <span>Salas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-full">
                <div className="space-y-1 p-4">
                  {chatRooms.map((room) => (
                    <Button
                      key={room.id}
                      variant={currentRoom?.id === room.id ? "secondary" : "ghost"}
                      className={`w-full justify-start p-3 h-auto ${
                        currentRoom?.id === room.id ? 'bg-primary/20 text-primary' : ''
                      }`}
                      onClick={() => handleRoomChange(room)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <Hash className="w-4 h-4" />
                          <span>{room.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {room.unread_count && room.unread_count > 0 && (
                            <Badge variant="destructive" className="h-5 text-xs">
                              {room.unread_count}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {room.participants}
                          </span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Main Chat */}
          <div className="lg:col-span-3">
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Hash className="w-6 h-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{currentRoom?.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {currentRoom?.participants} participantes
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-success" />
                    <span className="text-sm text-success">Protegido</span>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage = message.user_id === user?.id;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex items-start space-x-3 ${
                            isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                          }`}
                        >
                          <Avatar className="w-8 h-8 border-2 border-primary/30">
                            <AvatarImage src={message.avatar} alt={message.username} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs">
                              {message.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">
                                {message.username}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatMessageTime(message.timestamp)}
                              </span>
                            </div>
                            
                            <div
                              className={`inline-block p-3 rounded-lg max-w-xs lg:max-w-md ${
                                isOwnMessage
                                  ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                                  : 'bg-muted text-foreground'
                              } ${
                                message.is_filtered ? 'opacity-50' : ''
                              }`}
                            >
                              {message.is_filtered ? (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Shield className="w-4 h-4" />
                                  <span>Mensagem filtrada pelo sistema de segurança</span>
                                </div>
                              ) : (
                                <p className="text-sm leading-relaxed">
                                  {message.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-border/50 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Mensagem em #${currentRoom?.name}...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="bg-background/50 border-border/50"
                  />
                  <Button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                
                <p className="text-xs text-muted-foreground mt-2 flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Chat protegido contra discurso de ódio e conteúdo ofensivo</span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;