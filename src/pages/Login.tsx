import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Wallet } from 'lucide-react';

const Login: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, connectFreighter } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(nickname, password);
      navigate('/dashboard');
    } catch (error) {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreighterConnect = async () => {
    try {
      await connectFreighter();
    } catch (error) {
      // Error handled by AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary-foreground">C</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Connectus
          </h1>
          <p className="text-muted-foreground mt-2">
            Entre na sua conta para continuar
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Acesse sua conta do Connectus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="Seu nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleFreighterConnect}
              className="w-full border-primary/30 hover:bg-primary/10"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Conectar com Freighter
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Não tem uma conta? </span>
              <Link
                to="/register"
                className="text-primary hover:text-accent transition-colors font-medium"
              >
                Registrar-se
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2024 Connectus. Interface futurista para conexões autênticas.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;