import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Wallet, Shield } from 'lucide-react';

const Register: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, connectFreighter } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return; // Handle password mismatch
    }

    if (!agreedToTerms) {
      return; // Handle terms agreement
    }

    setIsLoading(true);

    try {
      await register(nickname, password, publicKey || undefined);
      navigate('/dashboard');
    } catch (error) {
      // Error handled by AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreighterConnect = async () => {
    try {
      // @ts-ignore - Freighter wallet integration
      if (window.freighterApi) {
        // @ts-ignore
        const key = await window.freighterApi.getPublicKey();
        setPublicKey(key);
      }
    } catch (error) {
      console.error('Error connecting Freighter:', error);
    }
  };

  const passwordsMatch = password === confirmPassword;
  const isFormValid = nickname && password && confirmPassword && passwordsMatch && agreedToTerms;

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
            Crie sua conta e entre na comunidade
          </p>
        </div>

        {/* Register Form */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Criar Conta</CardTitle>
            <CardDescription>
              Junte-se ao Connectus hoje mesmo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="Escolha um nickname único"
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
                    placeholder="Crie uma senha segura"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`bg-background/50 pr-10 ${
                      confirmPassword && !passwordsMatch ? 'border-destructive' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-destructive">As senhas não coincidem</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="publicKey">Chave Pública Stellar (Opcional)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="publicKey"
                    type="text"
                    placeholder="G... (opcional)"
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    className="bg-background/50"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFreighterConnect}
                    className="shrink-0"
                  >
                    <Wallet className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Aceito os termos de uso e política de privacidade</span>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                disabled={isLoading || !isFormValid}
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Já tem uma conta? </span>
              <Link
                to="/login"
                className="text-primary hover:text-accent transition-colors font-medium"
              >
                Fazer login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2024 Connectus. Plataforma segura para menores de idade.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;