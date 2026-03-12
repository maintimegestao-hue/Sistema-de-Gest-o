import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '@/hooks/useClientAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, QrCode, Building2 } from 'lucide-react';

const ClientServiceCall = () => {
  const { clientData, isAuthenticated, initialized } = useClientAuth();
  const navigate = useNavigate();

  // Verifica se o cliente está autenticado
  React.useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      navigate('/client-login');
      return;
    }
  }, [initialized, isAuthenticated, navigate]);

  if (!initialized || !clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/client-dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-red-100 rounded-lg p-2">
                  <Phone className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Abertura de Chamado
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {clientData?.clientName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Como você gostaria de identificar o equipamento?
          </h2>
          <p className="text-muted-foreground">
            Escolha uma das opções abaixo para localizar o equipamento com problema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Selecionar por Lista */}
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer h-64" 
            onClick={() => navigate('/client-service-call/equipment-list')}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-lg p-4">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Selecionar da Lista</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Escolha o equipamento pela localização
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Navegue pela lista dos seus equipamentos organizados por localização e selecione aquele que apresenta problema.
              </p>
              <div className="flex items-center text-sm text-primary font-medium">
                <span>Acessar lista de equipamentos</span>
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </div>
            </CardContent>
          </Card>

          {/* Escanear QR Code */}
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer h-64" 
            onClick={() => navigate('/client-service-call/qr-scanner')}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-lg p-4">
                  <QrCode className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Escanear QR Code</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Use a câmera do seu dispositivo
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Escaneie o código QR localizado no equipamento para identificá-lo automaticamente e abrir o chamado.
              </p>
              <div className="flex items-center text-sm text-primary font-medium">
                <span>Abrir câmera</span>
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações adicionais */}
        <div className="mt-8 p-6 bg-white rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">Informações importantes:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Certifique-se de estar próximo ao equipamento com problema</li>
            <li>• Tenha fotos do problema disponíveis para anexar ao chamado</li>
            <li>• Descreva detalhadamente o problema observado</li>
            <li>• Em casos de emergência, entre em contato por telefone</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ClientServiceCall;