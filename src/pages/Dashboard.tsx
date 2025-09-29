import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { missionsAPI, rankingAPI } from '@/services/api';
import {
  Trophy,
  Zap,
  Users,
  MessageCircle,
  Calendar,
  Target,
  Coins,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalUsers: number;
  onlineUsers: number;
  totalMissions: number;
  completedMissions: number;
  userRank: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMissions, setRecentMissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [missionsResponse, rankingResponse] = await Promise.all([
        missionsAPI.getUserProgress(),
        rankingAPI.getUserRanking(),
      ]);

      const progress = missionsResponse.data;
      const ranking = rankingResponse.data;

      setStats({
        totalUsers: 1250, // Mock data
        onlineUsers: 89,
        totalMissions: progress.total || 15,
        completedMissions: progress.completed || 0,
        userRank: ranking.position || 0,
      });

      setRecentMissions(progress.recent || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const missionProgress = stats ? (stats.completedMissions / stats.totalMissions) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Bem-vindo de volta, {user?.nickname}!
          </h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e explore novas missões no Connectus
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Seus Tokens</p>
                  <p className="text-2xl font-bold text-primary">{user?.tokens || 0}</p>
                </div>
                <Coins className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-accent/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">XP Total</p>
                  <p className="text-2xl font-bold text-accent">{user?.xp || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-success/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ranking</p>
                  <p className="text-2xl font-bold text-success">#{stats?.userRank || '-'}</p>
                </div>
                <Trophy className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-warning/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Missões</p>
                  <p className="text-2xl font-bold text-warning">
                    {stats?.completedMissions || 0}/{stats?.totalMissions || 0}
                  </p>
                </div>
                <Target className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress & Missions */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span>Progresso das Missões</span>
                </CardTitle>
                <CardDescription>
                  Complete missões para ganhar tokens e XP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso Geral</span>
                    <span>{Math.round(missionProgress)}%</span>
                  </div>
                  <Progress value={missionProgress} className="h-2" />
                </div>

                <div className="space-y-3">
                  {recentMissions.length > 0 ? (
                    recentMissions.slice(0, 3).map((mission, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                            <Target className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{mission.title}</p>
                            <p className="text-sm text-muted-foreground">{mission.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">+{mission.reward} tokens</p>
                          <p className="text-xs text-muted-foreground">+{mission.xp} XP</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma missão recente encontrada</p>
                    </div>
                  )}
                </div>

                <Link to="/missions">
                  <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    Ver Todas as Missões
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/timeline">
                  <Button variant="outline" className="w-full justify-start border-primary/30 hover:bg-primary/10">
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver Timeline
                  </Button>
                </Link>

                <Link to="/chat">
                  <Button variant="outline" className="w-full justify-start border-accent/30 hover:bg-accent/10">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat Global
                  </Button>
                </Link>

                <Link to="/ranking">
                  <Button variant="outline" className="w-full justify-start border-success/30 hover:bg-success/10">
                    <Trophy className="w-4 h-4 mr-2" />
                    Ver Ranking
                  </Button>
                </Link>

                <Link to="/profile">
                  <Button variant="outline" className="w-full justify-start border-warning/30 hover:bg-warning/10">
                    <Users className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Comunidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Usuários Online</span>
                  <span className="text-success font-medium">{stats?.onlineUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total de Membros</span>
                  <span className="text-primary font-medium">{stats?.totalUsers || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;