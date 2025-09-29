import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Calendar,
  Trophy,
  MessageCircle,
  User,
  LogOut,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Timeline', path: '/timeline', icon: Calendar },
    { name: 'Missões', path: '/missions', icon: Zap },
    { name: 'Ranking', path: '/ranking', icon: Trophy },
    { name: 'Chat', path: '/chat', icon: MessageCircle },
    { name: 'Perfil', path: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">C</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Connectus
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <div className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-semibold">
                {user.tokens} Tokens
              </div>
              <div className="text-muted-foreground">|</div>
              <div className="text-accent font-semibold">{user.xp} XP</div>
            </div>

            <Avatar className="w-8 h-8 border-2 border-primary/30">
              <AvatarImage src={user.avatar} alt={user.nickname} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                {user.nickname.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex overflow-x-auto pb-2 space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="w-3 h-3" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;