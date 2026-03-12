import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, ArrowLeft } from 'lucide-react';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useNavigate } from 'react-router-dom';

const ClientLogin = () => {
  const [accessCode, setAccessCode] = useState('');
  const { loginClient, isLoading, isAuthenticated, initialized } = useClientAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!initialized) return;
    if (isAuthenticated) {
      navigate('/client-dashboard');
    }
  }, [initialized, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      console.log('❌ Código de acesso vazio');
      return;
    }

    console.log('🚀 Iniciando processo de login para código:', accessCode);
    const success = await loginClient(accessCode);
    
    console.log('📊 Resultado do login:', success);
    
    if (success) {
      console.log('✅ Login bem-sucedido, redirecionando para /client-dashboard');
      navigate('/client-dashboard');
    } else {
      console.log('❌ Login falhou, permanecendo na página');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-primary rounded-lg p-3">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Maintime</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Portal do Cliente
          </p>
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 text-sm font-medium">
              🏢 Acesso exclusivo para clientes
            </p>
            <p className="text-green-600 text-xs mt-1">
              Digite o código de acesso fornecido pela equipe
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Acesso ao Portal
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Entre com seu código de acesso para visualizar seus dados
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessCode">Código de Acesso</Label>
                <Input
                  id="accessCode"
                  type="text"
                  placeholder="Digite seu código"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="text-center font-mono"
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Verificando...' : 'Acessar Portal'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar à página inicial
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;