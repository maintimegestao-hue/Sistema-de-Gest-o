import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClientAuth } from '@/hooks/useClientAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, ArrowLeft, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ClientServiceCallSuccess = () => {
  const { clientData } = useClientAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const callData = location.state?.callData;

  if (!callData) {
    navigate('/client-service-call');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-lg p-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Chamado Criado com Sucesso
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
        <div className="text-center mb-8">
          <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Chamado Aberto com Sucesso!
          </h2>
          <p className="text-muted-foreground">
            Seu chamado foi registrado e nossa equipe foi notificada
          </p>
        </div>

        {/* Detalhes do chamado */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Detalhes do Chamado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Número do Chamado
                </h4>
                <p className="text-lg font-mono font-bold text-primary">
                  {callData.callNumber}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Status
                </h4>
                <Badge variant="secondary" className="text-sm">
                  Em Análise
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Equipamento
                </h4>
                <p className="text-sm">{callData.equipment?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {callData.equipment?.location}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Data de Abertura
                </h4>
                <p className="text-sm">
                  {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Próximos passos */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2 mt-1">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold">Análise do Chamado</h4>
                  <p className="text-sm text-muted-foreground">
                    Nossa equipe técnica irá analisar o problema reportado e definir a prioridade de atendimento.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2 mt-1">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold">Agendamento do Atendimento</h4>
                  <p className="text-sm text-muted-foreground">
                    Entraremos em contato para agendar a visita técnica no menor prazo possível.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2 mt-1">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold">Resolução do Problema</h4>
                  <p className="text-sm text-muted-foreground">
                    Nosso técnico realizará o diagnóstico e reparo necessário para resolver o problema.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações de contato */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Precisa de Ajuda?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-semibold text-sm">Emergências</h4>
                  <p className="text-sm text-muted-foreground">
                    Para problemas críticos, ligue diretamente
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <ExternalLink className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-semibold text-sm">Portal do Cliente</h4>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe o status do seu chamado
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/client-service-call')}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Abrir Outro Chamado
          </Button>
          <Button 
            onClick={() => navigate('/client-dashboard')}
            className="flex-1"
          >
            Voltar ao Portal
          </Button>
        </div>

        {/* Nota importante */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-semibold text-amber-800 mb-2">⚠️ Importante</h4>
          <p className="text-sm text-amber-700">
            Guarde o número do chamado <strong>{callData.callNumber}</strong> para futuras consultas. 
            Nossa equipe entrará em contato em breve para agendar o atendimento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientServiceCallSuccess;