import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { missionsAPI } from '@/services/api';
import { 
  Zap, 
  Calendar, 
  Crown, 
  Target, 
  CheckCircle, 
  Lock,
  Gift,
  Clock,
  Trophy,
  Star
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  status: 'available' | 'in_progress' | 'completed' | 'locked';
  progress: {
    current: number;
    total: number;
  };
  reward: {
    tokens: number;
    xp: number;
  };
  deadline?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const Missions: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completingMission, setCompletingMission] = useState<string | null>(null);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const response = await missionsAPI.getMissions();
      setMissions(response.data.missions || []);
    } catch (error) {
      console.error('Error loading missions:', error);
      // Mock data for demo
      setMissions([
        {
          id: '1',
          title: 'Primeiro Post',
          description: 'Crie seu primeiro post na timeline',
          type: 'daily',
          status: 'available',
          progress: { current: 0, total: 1 },
          reward: { tokens: 100, xp: 50 },
          difficulty: 'easy'
        },
        {
          id: '2',
          title: 'Conecte sua Carteira',
          description: 'Conecte sua carteira Freighter ao perfil',
          type: 'daily',
          status: user?.public_key ? 'completed' : 'available',
          progress: { current: user?.public_key ? 1 : 0, total: 1 },
          reward: { tokens: 200, xp: 100 },
          difficulty: 'easy'
        },
        {
          id: '3',
          title: 'Socializador Ativo',
          description: 'Curta 10 posts de outros usuários',
          type: 'daily',
          status: 'available',
          progress: { current: 3, total: 10 },
          reward: { tokens: 150, xp: 75 },
          difficulty: 'medium'
        },
        {
          id: '4',
          title: 'Explorador Semanal',
          description: 'Visite todas as seções da plataforma',
          type: 'weekly',
          status: 'in_progress',
          progress: { current: 4, total: 6 },
          reward: { tokens: 500, xp: 200 },
          deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          difficulty: 'medium'
        },
        {
          id: '5',
          title: 'Mestre da Comunidade',
          description: 'Atinja o top 10 no ranking global',
          type: 'special',
          status: 'locked',
          progress: { current: 0, total: 1 },
          reward: { tokens: 1000, xp: 500 },
          difficulty: 'hard'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteMission = async (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.status !== 'available') return;

    setCompletingMission(missionId);
    try {
      await missionsAPI.completeMission(missionId);
      
      // Update mission status
      setMissions(missions.map(m => 
        m.id === missionId 
          ? { ...m, status: 'completed' as const, progress: { ...m.progress, current: m.progress.total } }
          : m
      ));

      // Update user tokens and XP
      if (user) {
        updateUser({
          tokens: user.tokens + mission.reward.tokens,
          xp: user.xp + mission.reward.xp
        });
      }

      toast({
        title: "Missão Completada! 🎉",
        description: `Você ganhou ${mission.reward.tokens} tokens e ${mission.reward.xp} XP!`,
      });
    } catch (error) {
      toast({
        title: "Erro ao completar missão",
        description: "Não foi possível completar a missão.",
        variant: "destructive",
      });
    } finally {
      setCompletingMission(null);
    }
  };

  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'daily': return Calendar;
      case 'weekly': return Clock;
      case 'special': return Crown;
      default: return Target;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-success border-success/30';
      case 'medium': return 'text-warning border-warning/30';
      case 'hard': return 'text-destructive border-destructive/30';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'locked': return Lock;
      default: return Target;
    }
  };

  const filterMissions = (type: string) => {
    if (type === 'all') return missions;
    return missions.filter(mission => mission.type === type);
  };

  const formatTimeRemaining = (deadline?: string) => {
    if (!deadline) return null;
    
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h restantes`;
    return `${hours}h restantes`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
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
            Missões
          </h1>
          <p className="text-muted-foreground">
            Complete missões para ganhar tokens e XP
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Missões Completas</p>
                  <p className="text-2xl font-bold text-success">
                    {missions.filter(m => m.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em Progresso</p>
                  <p className="text-2xl font-bold text-primary">
                    {missions.filter(m => m.status === 'in_progress').length}
                  </p>
                </div>
                <Target className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tokens Ganhos Hoje</p>
                  <p className="text-2xl font-bold text-accent">+250</p>
                </div>
                <Trophy className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Missions Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card/50">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="daily">Diárias</TabsTrigger>
            <TabsTrigger value="weekly">Semanais</TabsTrigger>
            <TabsTrigger value="special">Especiais</TabsTrigger>
          </TabsList>

          {['all', 'daily', 'weekly', 'special'].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filterMissions(tabValue).map((mission) => {
                  const MissionIcon = getMissionIcon(mission.type);
                  const StatusIcon = getStatusIcon(mission.status);
                  const progressPercentage = (mission.progress.current / mission.progress.total) * 100;
                  
                  return (
                    <Card 
                      key={mission.id}
                      className={`bg-gradient-to-br from-card to-card/50 border-border/50 transition-all duration-200 ${
                        mission.status === 'available' ? 'hover:border-primary/30 hover:shadow-lg' : ''
                      } ${
                        mission.status === 'completed' ? 'border-success/30' : ''
                      } ${
                        mission.status === 'locked' ? 'opacity-60' : ''
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MissionIcon className="w-5 h-5 text-primary" />
                            <Badge variant="outline" className={getDifficultyColor(mission.difficulty)}>
                              {mission.difficulty}
                            </Badge>
                            {mission.deadline && (
                              <Badge variant="outline" className="text-warning border-warning/30">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTimeRemaining(mission.deadline)}
                              </Badge>
                            )}
                          </div>
                          <StatusIcon className={`w-5 h-5 ${
                            mission.status === 'completed' ? 'text-success' : 
                            mission.status === 'locked' ? 'text-muted-foreground' : 'text-primary'
                          }`} />
                        </div>
                        <CardTitle className="text-lg">{mission.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {mission.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{mission.progress.current}/{mission.progress.total}</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>

                        {/* Rewards */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Gift className="w-4 h-4 text-primary" />
                              <span className="text-primary font-medium">
                                {mission.reward.tokens} tokens
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-accent" />
                              <span className="text-accent font-medium">
                                {mission.reward.xp} XP
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <Button
                            size="sm"
                            onClick={() => handleCompleteMission(mission.id)}
                            disabled={
                              mission.status !== 'available' || 
                              completingMission === mission.id ||
                              progressPercentage < 100
                            }
                            className={`${
                              mission.status === 'completed' 
                                ? 'bg-success hover:bg-success/90' 
                                : mission.status === 'locked'
                                ? 'bg-muted' 
                                : 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
                            }`}
                          >
                            {completingMission === mission.id ? (
                              'Completando...'
                            ) : mission.status === 'completed' ? (
                              'Completada'
                            ) : mission.status === 'locked' ? (
                              'Bloqueada'
                            ) : progressPercentage < 100 ? (
                              'Em Progresso'
                            ) : (
                              'Completar'
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filterMissions(tabValue).length === 0 && (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-xl font-semibold text-muted-foreground">
                    Nenhuma missão disponível
                  </p>
                  <p className="text-muted-foreground">
                    Novas missões serão adicionadas em breve!
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Missions;