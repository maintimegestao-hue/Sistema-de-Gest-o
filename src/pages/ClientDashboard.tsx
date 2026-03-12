import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '@/hooks/useClientAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileBarChart, LogOut, Building2, Phone } from 'lucide-react';

const ClientDashboard = () => {
  const { clientData, logoutClient, isAuthenticated, initialized } = useClientAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized) return; // aguarda carregar do localStorage
    if (!isAuthenticated) {
      navigate('/client-login');
    }
  }, [initialized, isAuthenticated, navigate]);

  const handleLogout = () => {
    logoutClient();
    navigate('/');
  };

  if (!clientData) {
    return <div>Carregando...</div>;
  }

  const { permissions } = clientData;

  console.log('ClientDashboard - Cliente autenticado:', {
    clientName: clientData.clientName,
    clientId: clientData.clientId,
    permissions: permissions
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Maintime</h1>
                <p className="text-sm text-muted-foreground">
                  Portal do Cliente - {clientData.clientName}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo, {clientData.clientName}
          </h2>
          <p className="text-muted-foreground">
            Acesse suas informações de manutenção e relatórios
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {permissions?.preventive_schedule === true && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => navigate(`/client-preventive-schedule/${clientData.clientId}`)}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Cronograma Anual</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Visualize sua agenda preventiva
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acompanhe o cronograma de manutenções preventivas dos seus equipamentos
                </p>
              </CardContent>
            </Card>
          )}

          {permissions?.managerial_reports === true && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate('/client-reports')}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 rounded-lg p-3">
                    <FileBarChart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Relatórios Gerenciais</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Análises e indicadores
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acesse relatórios detalhados sobre suas manutenções e performance
                </p>
              </CardContent>
            </Card>
          )}

          {permissions?.equipment_maintenance === true && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate('/client-equipment-maintenance')}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 rounded-lg p-3">
                    <Building2 className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Manutenção de Equipamentos</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Controle de equipamentos
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visualize e acompanhe seus equipamentos e status de manutenção
                </p>
              </CardContent>
            </Card>
          )}

          {permissions?.maintenance_history === true && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate('/client-maintenance-history')}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 rounded-lg p-3">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Histórico de Manutenções</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Consulte o histórico
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acesse o histórico completo de manutenções realizadas
                </p>
              </CardContent>
            </Card>
          )}

          {permissions?.technical_reports === true && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate('/client-technical-reports')}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-100 rounded-lg p-3">
                    <FileBarChart className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Relatórios Técnicos</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Análises técnicas
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Visualize relatórios técnicos detalhados dos equipamentos
                </p>
              </CardContent>
            </Card>
          )}

          {/* Abertura de Chamado */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  console.log('Clicando em Abrir Chamado - navegando para /client-service-call');
                  navigate('/client-service-call');
                }}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 rounded-lg p-3">
                  <Phone className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Abrir Chamado</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Reportar problemas
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Relate problemas nos equipamentos e solicite atendimento técnico
              </p>
            </CardContent>
          </Card>

          {/* Meus Chamados */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/client-service-calls')}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 rounded-lg p-3">
                  <Phone className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Meus Chamados</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe seus chamados
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Veja os chamados abertos nas últimas 24h com destaque e o histórico completo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Empty state if no permissions */}
        {permissions?.preventive_schedule !== true && permissions?.managerial_reports !== true && 
         permissions?.equipment_maintenance !== true && permissions?.maintenance_history !== true && 
         permissions?.technical_reports !== true && (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum acesso configurado</h3>
              <p className="text-muted-foreground">
                Entre em contato com a equipe para configurar suas permissões de acesso
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;