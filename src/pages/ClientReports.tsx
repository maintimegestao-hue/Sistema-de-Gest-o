import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '@/hooks/useClientAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2 } from 'lucide-react';
import ManagerialReport from '@/components/reports/ManagerialReport';

const ClientReports = () => {
  const { clientData, isAuthenticated } = useClientAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/client-login');
      return;
    }

    if (!clientData?.permissions?.managerial_reports) {
      navigate('/client-dashboard');
    }
  }, [isAuthenticated, clientData, navigate]);

  if (!clientData) {
    return <div>Carregando...</div>;
  }

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
                  Relatórios Gerenciais - {clientData.clientName}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/client-dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ManagerialReport clientId={clientData.clientId} />
      </div>
    </div>
  );
};

export default ClientReports;