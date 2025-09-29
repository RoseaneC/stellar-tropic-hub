import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { rankingAPI } from '@/services/api';
import { Trophy, Medal, Award, Crown, TrendingUp, Users } from 'lucide-react';

interface RankingUser {
  id: string;
  nickname: string;
  avatar?: string;
  position: number;
  tokens: number;
  xp: number;
  missions_completed: number;
  change?: number; // Position change from last week
}

const Ranking: React.FC = () => {
  const { user } = useAuth();
  const [rankings, setRankings] = useState<{
    tokens: RankingUser[];
    xp: RankingUser[];
    missions: RankingUser[];
  }>({
    tokens: [],
    xp: [],
    missions: []
  });
  const [userPosition, setUserPosition] = useState<RankingUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadRankings();
  }, [currentPage]);

  const loadRankings = async () => {
    try {
      const [globalResponse, userResponse] = await Promise.all([
        rankingAPI.getGlobalRanking(currentPage),
        rankingAPI.getUserRanking()
      ]);

      const globalData = globalResponse.data;
      const userData = userResponse.data;

      setRankings({
        tokens: globalData.tokens || [],
        xp: globalData.xp || [],
        missions: globalData.missions || []
      });

      setUserPosition(userData);
      setHasMore(globalData.has_more || false);
    } catch (error) {
      console.error('Error loading rankings:', error);
      
      // Mock data for demo
      const mockUsers = Array.from({ length: 20 }, (_, i) => ({
        id: `user${i + 1}`,
        nickname: `user_${i + 1}`,
        position: i + 1,
        tokens: Math.floor(Math.random() * 10000) + 1000,
        xp: Math.floor(Math.random() * 5000) + 500,
        missions_completed: Math.floor(Math.random() * 50) + 10,
        change: Math.floor(Math.random() * 21) - 10 // -10 to +10
      }));

      setRankings({
        tokens: [...mockUsers].sort((a, b) => b.tokens - a.tokens),
        xp: [...mockUsers].sort((a, b) => b.xp - a.xp),
        missions: [...mockUsers].sort((a, b) => b.missions_completed - a.missions_completed)
      });

      if (user) {
        setUserPosition({
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          position: 15,
          tokens: user.tokens,
          xp: user.xp,
          missions_completed: 8,
          change: 2
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-yellow-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 2: return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3: return 'from-yellow-600/20 to-yellow-700/20 border-yellow-600/30';
      default: return 'from-card to-card/50 border-border/50';
    }
  };

  const getChangeIndicator = (change?: number) => {
    if (!change) return null;
    
    if (change > 0) {
      return (
        <div className="flex items-center text-success text-sm">
          <TrendingUp className="w-3 h-3 mr-1" />
          +{change}
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-destructive text-sm">
          <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
          {change}
        </div>
      );
    }
    
    return (
      <div className="text-muted-foreground text-sm">
        -
      </div>
    );
  };

  const RankingList = ({ users, metric }: { users: RankingUser[], metric: 'tokens' | 'xp' | 'missions' }) => (
    <div className="space-y-3">
      {users.map((rankUser, index) => {
        const isCurrentUser = user?.id === rankUser.id;
        
        return (
          <Card 
            key={rankUser.id}
            className={`bg-gradient-to-r transition-all duration-200 hover:scale-[1.02] ${
              isCurrentUser 
                ? 'from-primary/20 to-accent/20 border-primary/30' 
                : getPositionColor(rankUser.position)
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(rankUser.position)}
                  </div>
                  
                  <Avatar className="w-12 h-12 border-2 border-primary/30">
                    <AvatarImage src={rankUser.avatar} alt={rankUser.nickname} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      {rankUser.nickname.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold">{rankUser.nickname}</p>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs text-primary border-primary/30">
                          Você
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{rankUser.tokens} tokens</span>
                      <span>{rankUser.xp} XP</span>
                      <span>{rankUser.missions_completed} missões</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {metric === 'tokens' ? rankUser.tokens.toLocaleString() : 
                       metric === 'xp' ? rankUser.xp.toLocaleString() : 
                       rankUser.missions_completed}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {metric === 'tokens' ? 'tokens' : 
                       metric === 'xp' ? 'XP' : 
                       'missões'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-1">
                    {getChangeIndicator(rankUser.change)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {hasMore && (
        <div className="text-center py-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={isLoading}
          >
            Carregar Mais
          </Button>
        </div>
      )}
    </div>
  );

  if (isLoading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg"></div>
            ))}
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
            Ranking Global
          </h1>
          <p className="text-muted-foreground">
            Veja os melhores usuários da comunidade Connectus
          </p>
        </div>

        {/* User Position */}
        {userPosition && (
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span>Sua Posição</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(userPosition.position)}
                  </div>
                  
                  <Avatar className="w-12 h-12 border-2 border-primary/30">
                    <AvatarImage src={userPosition.avatar} alt={userPosition.nickname} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      {userPosition.nickname.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <p className="font-semibold text-lg">{userPosition.nickname}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{userPosition.tokens} tokens</span>
                      <span>{userPosition.xp} XP</span>
                      <span>{userPosition.missions_completed} missões</span>
                    </div>
                  </div>
                </div>

                {getChangeIndicator(userPosition.change)}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rankings Tabs */}
        <Tabs defaultValue="tokens" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50">
            <TabsTrigger value="tokens" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Tokens</span>
            </TabsTrigger>
            <TabsTrigger value="xp" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>XP</span>
            </TabsTrigger>
            <TabsTrigger value="missions" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Missões</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tokens" className="space-y-6">
            <RankingList users={rankings.tokens} metric="tokens" />
          </TabsContent>

          <TabsContent value="xp" className="space-y-6">
            <RankingList users={rankings.xp} metric="xp" />
          </TabsContent>

          <TabsContent value="missions" className="space-y-6">
            <RankingList users={rankings.missions} metric="missions" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Ranking;