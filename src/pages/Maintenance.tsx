
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormModal from "@/components/modals/FormModal";
import NewMaintenanceOrderForm from "@/components/forms/NewMaintenanceOrderForm";
import FilterModal from "@/components/filters/FilterModal";
import MaintenanceOrderCard from "@/components/maintenance/MaintenanceOrderCard";
import { useSecureMaintenanceOrdersByClient } from "@/hooks/useSecureMaintenanceOrdersByClient";
import { sanitizeSearchTerm } from "@/lib/validation";
import { useToast } from "@/hooks/use-toast";
import { useClientContext } from "@/contexts/ClientContext";
import ClientSelector from "@/components/dashboard/ClientSelector";
import ClientHeader from "@/components/dashboard/ClientHeader";
import { useServiceCallsCount } from "@/hooks/useServiceCallsCount";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const Maintenance = () => {
  const { selectedClientId } = useClientContext();
  const { data: userProfile } = useUserProfile();
  const { data: serviceCallsCount } = useServiceCallsCount(userProfile?.user_id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNewOSModalOpen, setIsNewOSModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<any>({});
  
  const { data: maintenanceOrders, isLoading } = useSecureMaintenanceOrdersByClient(selectedClientId);

  // Se nenhum cliente foi selecionado, mostra o seletor
  if (!selectedClientId) {
    return <ClientSelector />;
  }

  const handleNewOSSuccess = () => {
    setIsNewOSModalOpen(false);
  };

  const handleExecuteOrder = (orderId: string) => {
    navigate('/execute-maintenance', { state: { selectedOrderId: orderId } });
  };

  const handleCompleteOrder = (orderId: string) => {
    toast({
      title: 'Manutenção concluída',
      description: 'A manutenção foi marcada como concluída.',
    });
  };

  const handleDeleteMaintenanceOrder = (id: string) => {
    toast({
      title: 'Manutenção excluída',
      description: 'A ordem de manutenção foi excluída.',
    });
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeSearchTerm(e.target.value);
    setSearchTerm(sanitized);
  };

  // Filtrar ordens de serviço
  const filteredOrders = maintenanceOrders?.filter(order => {
    // Filtro de busca
    if (searchTerm && !order.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !order.id.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filtros específicos
    if (filters.status && order.status !== filters.status) return false;
    if (filters.type && order.maintenance_type !== filters.type) return false;
    if (filters.priority && order.priority !== filters.priority) return false;

    return true;
  });

  const renderMaintenanceSection = (title: string, status: string, orders: any[]) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-evolutec-black mb-4">{title}</h2>
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-evolutec-text">Carregando...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-evolutec-text">Nenhuma manutenção {status.toLowerCase()}</p>
          </div>
        ) : (
          orders.map(order => (
            <MaintenanceOrderCard
              key={order.id}
              order={order}
              onExecute={handleExecuteOrder}
              onComplete={handleCompleteOrder}
              onDelete={handleDeleteMaintenanceOrder}
            />
          ))
        )}
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <ClientHeader />
          
          {/* Alerta de Chamados Pendentes */}
          {serviceCallsCount && serviceCallsCount > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Você tem {serviceCallsCount} chamado{serviceCallsCount > 1 ? 's' : ''} de serviço pendente{serviceCallsCount > 1 ? 's' : ''} que precisa{serviceCallsCount > 1 ? 'm' : ''} de atenção.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Agenda de Manutenção</h1>
              <p className="text-muted-foreground mt-2">
                Gerencie ordens de serviço e agendamentos
              </p>
            </div>
            <Button 
              onClick={() => setIsNewOSModalOpen(true)}
            >
              <Plus size={16} className="mr-2" />
              Nova O.S.
            </Button>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-evolutec-text" />
              <input
                type="text"
                placeholder="Buscar manutenções..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-evolutec-green focus:border-transparent"
                maxLength={100}
              />
            </div>
            <Button variant="outline" onClick={() => setIsFilterModalOpen(true)}>
              <Filter size={16} className="mr-2" />
              Filtros
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {renderMaintenanceSection(
              "Manutenções Pendentes",
              "pending",
              filteredOrders?.filter(order => order.status === 'pending') || []
            )}
            
            {renderMaintenanceSection(
              "Manutenções em Andamento",
              "in_progress",
              filteredOrders?.filter(order => order.status === 'in_progress') || []
            )}
            
            {renderMaintenanceSection(
              "Manutenções Concluídas",
              "completed",
              filteredOrders?.filter(order => order.status === 'completed') || []
            )}
          </div>
        </div>
      </DashboardLayout>

      <FormModal
        isOpen={isNewOSModalOpen}
        onClose={() => setIsNewOSModalOpen(false)}
        title="Nova Ordem de Serviço"
      >
        <NewMaintenanceOrderForm onSuccess={handleNewOSSuccess} />
      </FormModal>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        type="maintenance"
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </ProtectedRoute>
  );
};

export default Maintenance;
