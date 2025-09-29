import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI, missionsAPI } from '@/services/api';
import { 
  User, 
  Edit3, 
  Wallet, 
  Trophy, 
  Target, 
  Calendar,
  Star,
  Settings,
  Shield,
  Camera,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserStats {
  total_missions: number;
  completed_missions: number;
  current_streak: number;
  best_streak: number;
  join_date: string;
  last_active: string;
}

const Profile: React.FC = () => {
  const { user, updateUser, connectFreighter } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [formData, setFormData] = useState({
    nickname: user?.nickname || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname,
        bio: user.bio || '',
        avatar: user.avatar || ''
      });
    }
    loadUserStats();
  }, [user]);

  const loadUserStats = async () => {
    try {
      const response = await missionsAPI.getUserProgress();
      const progress = response.data;
      
      setStats({
        total_missions: progress.total || 15,
        completed_missions: progress.completed || 8,
        current_streak: progress.streak || 3,
        best_streak: progress.best_streak || 7,
        join_date: '2024-01-15',
        last_active: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
      // Mock stats for demo
      setStats({
        total_missions: 15,
        completed_missions: 8,
        current_streak: 3,
        best_streak: 7,
        join_date: '2024-01-15',
        last_active: new Date().toISOString()
      });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await authAPI.updateProfile({
        nickname: formData.nickname,
        bio: formData.bio,
        avatar: formData.avatar
      });

      updateUser({
        nickname: formData.nickname,
        bio: formData.bio,
        avatar: formData.avatar
      });

      setIsEditing(false);
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.response?.data?.message || "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      await connectFreighter();
      toast({
        title: "Carteira conectada!",
        description: "Freighter wallet conectada com sucesso.",
      });
    } catch (error) {
      // Error handled by AuthContext
    }
  };

  const calculateLevel = (xp: number) => {
    return Math.floor(xp / 100) + 1;
  };

  const calculateXpProgress = (xp: number) => {
    const currentLevelXp = (calculateLevel(xp) - 1) * 100;
    const nextLevelXp = calculateLevel(xp) * 100;
    return ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  };

  const formatJoinDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-xl font-semibold text-muted-foreground">
              Carregando perfil...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4">
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Meu Perfil
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas informações e acompanhe seu progresso
          </p>
        </div>

        {/* Profile Overview */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-primary/30">
                  <AvatarImage src={user.avatar} alt={user.nickname} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-3xl">
                    {user.nickname.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full"
                    variant="secondary"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left space-y-4">
                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nickname">Nickname</Label>
                      <Input
                        id="nickname"
                        value={formData.nickname}
                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Conte um pouco sobre você..."
                        className="bg-background/50"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        {isSaving ? 'Salvando...' : 'Salvar'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <h2 className="text-3xl font-bold">{user.nickname}</h2>
                      <p className="text-muted-foreground mt-1">
                        {user.bio || 'Olá! Sou novo no Connectus 👋'}
                      </p>
                    </div>

                    {/* Level & XP */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-center md:justify-start space-x-2">
                        <Badge variant="outline" className="text-primary border-primary/30">
                          <Star className="w-3 h-3 mr-1" />
                          Nível {calculateLevel(user.xp)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {user.xp} XP
                        </span>
                      </div>
                      <div className="w-full max-w-md">
                        <Progress value={calculateXpProgress(user.xp)} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.ceil((calculateLevel(user.xp) * 100 - user.xp))} XP para o próximo nível
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Editar Perfil
                      </Button>

                      {!user.public_key ? (
                        <Button
                          onClick={handleConnectWallet}
                          className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        >
                          <Wallet className="w-4 h-4 mr-2" />
                          Conectar Carteira
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-success border-success/30">
                          <Wallet className="w-3 h-3 mr-1" />
                          Carteira Conectada
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary/10 border-primary/30">
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold text-primary">{user.tokens}</p>
                    <p className="text-xs text-muted-foreground">Tokens</p>
                  </CardContent>
                </Card>

                <Card className="bg-accent/10 border-accent/30">
                  <CardContent className="p-4 text-center">
                    <Target className="w-8 h-8 mx-auto mb-2 text-accent" />
                    <p className="text-2xl font-bold text-accent">{stats?.completed_missions}</p>
                    <p className="text-xs text-muted-foreground">Missões</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Stats */}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50">
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="wallet">Carteira</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span>Progresso das Missões</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Completadas</span>
                    <span className="font-bold">{stats?.completed_missions}/{stats?.total_missions}</span>
                  </div>
                  <Progress 
                    value={stats ? (stats.completed_missions / stats.total_missions) * 100 : 0} 
                    className="h-2" 
                  />
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">{stats?.current_streak}</p>
                      <p className="text-sm text-muted-foreground">Sequência Atual</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-warning">{stats?.best_streak}</p>
                      <p className="text-sm text-muted-foreground">Melhor Sequência</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    <span>Atividade</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Membro desde</span>
                      <span className="text-sm font-medium">
                        {stats ? formatJoinDate(stats.join_date) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Última atividade</span>
                      <span className="text-sm font-medium">Agora</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Nível atual</span>
                      <Badge variant="outline" className="text-primary border-primary/30">
                        Nível {calculateLevel(user.xp)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  <span>Carteira Stellar</span>
                </CardTitle>
                <CardDescription>
                  Gerencie sua conexão com a carteira Freighter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {user.public_key ? (
                  <>
                    <div className="flex items-center space-x-2 p-4 bg-success/10 border border-success/30 rounded-lg">
                      <Shield className="w-5 h-5 text-success" />
                      <span className="text-success font-medium">Carteira conectada com sucesso</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Chave Pública</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={user.public_key}
                          readOnly
                          className="bg-background/50 font-mono text-sm"
                        />
                        <Button variant="outline" size="sm">
                          <LinkIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <Button
                        variant="outline"
                        onClick={handleConnectWallet}
                        className="w-full"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Reconectar Carteira
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4 py-8">
                    <Wallet className="w-16 h-16 mx-auto text-muted-foreground/50" />
                    <div>
                      <p className="text-lg font-semibold">Carteira não conectada</p>
                      <p className="text-muted-foreground">
                        Conecte sua carteira Freighter para funcionalidades avançadas
                      </p>
                    </div>
                    <Button
                      onClick={handleConnectWallet}
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Conectar Freighter
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <span>Configurações da Conta</span>
                </CardTitle>
                <CardDescription>
                  Gerencie suas preferências e configurações de privacidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                    <div>
                      <p className="font-medium">Notificações</p>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações sobre missões e mensagens
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                    <div>
                      <p className="font-medium">Privacidade</p>
                      <p className="text-sm text-muted-foreground">
                        Controlar quem pode ver seu perfil e atividade
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                    <div>
                      <p className="font-medium">Segurança</p>
                      <p className="text-sm text-muted-foreground">
                        Alterar senha e configurações de segurança
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;