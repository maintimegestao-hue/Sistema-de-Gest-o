import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, ArrowLeft } from 'lucide-react';
import { useFieldAuth } from '@/hooks/useFieldAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const FieldLogin = () => {
  const [accessCode, setAccessCode] = useState('');
  const { loginFieldTechnician, isLoading } = useFieldAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 Formulário submetido com código:', accessCode);
    
    if (!accessCode.trim()) {
      console.log('❌ Código vazio');
      toast({
        title: 'Código obrigatório',
        description: 'Por favor, insira o código de acesso.',
        variant: 'destructive',
      });
      return;
    }

    console.log('🚀 Chamando loginFieldTechnician...');
    const success = await loginFieldTechnician(accessCode);
    
    console.log('📊 Resultado do login:', success);
    
    if (success) {
      console.log('✅ Login bem-sucedido, navegando para /field-access');
      navigate('/field-access');
    } else {
      console.log('❌ Login falhou, permanecendo na página');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-primary rounded-lg p-3">
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Maintime</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Acesso para Técnicos de Campo
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm font-medium">
              📱 Esta é a página correta para técnicos!
            </p>
            <p className="text-blue-600 text-xs mt-1">
              Digite o código enviado pelo seu supervisor
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Acesso Técnico
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Digite o código de acesso fornecido pelo seu supervisor
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
                {isLoading ? 'Verificando...' : 'Acessar Sistema'}
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

export default FieldLogin;