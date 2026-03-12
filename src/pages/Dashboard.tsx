
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardRecentActivity from "@/components/dashboard/DashboardRecentActivity";
import DashboardUpcomingMaintenance from "@/components/dashboard/DashboardUpcomingMaintenance";
import DashboardServiceCalls from "@/components/dashboard/DashboardServiceCalls";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import TrialBanner from "@/components/dashboard/TrialBanner";
import ClientSelector from "@/components/dashboard/ClientSelector";
import ClientHeader from "@/components/dashboard/ClientHeader";
import { useClientContext } from "@/contexts/ClientContext";

const Dashboard = () => {
  const { selectedClientId, isAllClients } = useClientContext();

  // Se nenhum cliente foi selecionado e não é "todos", mostra o seletor
  // Permite acesso direto quando isAllClients é true
  if (!selectedClientId && !isAllClients) {
    return (
      <ProtectedRoute>
        <ClientSelector />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-4 lg:space-y-6">
          <ClientHeader />
          
          <div className="text-center lg:text-left">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-2 text-sm lg:text-base">
              Visão geral do seu sistema de manutenção
            </p>
          </div>
          
          <TrialBanner />
          
          <DashboardStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <DashboardRecentActivity />
            <DashboardServiceCalls />
          </div>
          
          <DashboardUpcomingMaintenance />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Dashboard;
