import React from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFieldAuth } from '@/hooks/useFieldAuth';
import { Wrench, LogOut, QrCode, Clipboard } from 'lucide-react';
import FieldMaintenanceView from '@/components/field/FieldMaintenanceView';

const FieldAccess = () => {
  const { fieldTechnician, isAuthenticated, isInitializing, logoutFieldTechnician } = useFieldAuth();

  console.log('🔧 FieldAccess renderizado');
  console.log('👤 Dados do técnico:', fieldTechnician);
  console.log('🔐 Está autenticado?', isAuthenticated);
  console.log('⏳ Está inicializando?', isInitializing);
  console.log('💾 localStorage field_session:', localStorage.getItem('field_session'));

  // Aguardar a inicialização antes de redirecionar
  if (isInitializing) {
    console.log('⏳ Aguardando inicialização...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('❌ Técnico não autenticado, redirecionando para /field');
    return <Navigate to="/field" replace />;
  }

  console.log('✅ Técnico autenticado, renderizando página');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header fixo */}
      <div className="sticky top-0 bg-white shadow-sm border-b z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Campo Técnico</h1>
                <p className="text-sm text-muted-foreground">
                  Bem-vindo, {fieldTechnician?.name}
                </p>
              </div>
            </div>
            
            <Button variant="outline" onClick={logoutFieldTechnician}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <FieldMaintenanceView />
      </div>
    </div>
  );
};

export default FieldAccess;