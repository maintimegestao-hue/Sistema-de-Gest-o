import React from 'react';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientAccessManagement from '@/components/dashboard/ClientAccessManagement';

const ClientAccessManagementPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Gerenciar Acessos de Clientes
          </h1>
          <p className="text-muted-foreground">
            Crie e gerencie códigos de acesso para seus clientes visualizarem informações específicas
          </p>
        </div>
        
        <ClientAccessManagement />
      </div>
    </DashboardLayout>
  );
};

export default ClientAccessManagementPage;