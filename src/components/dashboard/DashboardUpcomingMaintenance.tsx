
import { Calendar, Clock, User } from "lucide-react";
import { useSecureMaintenanceOrdersByClient } from "@/hooks/useSecureMaintenanceOrdersByClient";
import { useSecureEquipments } from "@/hooks/useSecureEquipments";
import { useSecureTechnicians } from "@/hooks/useSecureTechnicians";
import { useClientContext } from "@/contexts/ClientContext";

const DashboardUpcomingMaintenance = () => {
  const { selectedClientId } = useClientContext();
  const { data: maintenanceOrders } = useSecureMaintenanceOrdersByClient(selectedClientId || '');
  const { data: equipments } = useSecureEquipments();
  const { data: technicians } = useSecureTechnicians();

  // Filtrar equipamentos pelo cliente selecionado
  const clientEquipments = equipments?.filter(eq => eq.client_id === selectedClientId) || [];

  // Filtrar manutenções pendentes e agendadas nos próximos 7 dias
  const upcomingMaintenances = maintenanceOrders
    ?.filter(order => {
      if (order.status !== 'pending' || !order.scheduled_date) return false;
      
      const orderDate = new Date(order.scheduled_date);
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      return orderDate >= today && orderDate <= weekFromNow;
    })
    .sort((a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime())
    .slice(0, 3) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    if (date.toDateString() === today.toDateString()) {
      return "Hoje";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Amanhã";
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-600';
      case 'high': return 'bg-orange-100 text-orange-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'low': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getMaintenanceTypeLabel = (type: string) => {
    switch (type) {
      case 'preventive': return 'Preventiva';
      case 'corrective': return 'Corretiva';
      case 'predictive': return 'Preditiva';
      case 'emergency': return 'Emergencial';
      default: return type;
    }
  };

  if (!upcomingMaintenances.length) {
    return (
      <div className="evolutec-card">
        <h3 className="text-lg font-semibold text-evolutec-black mb-4">
          Próximas Manutenções
        </h3>
        <div className="text-center py-8">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-evolutec-text">Nenhuma manutenção agendada</p>
          <p className="text-sm text-evolutec-text mt-2">
            Agende manutenções na seção "Manutenções"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="evolutec-card">
      <h3 className="text-lg font-semibold text-evolutec-black mb-4">
        Próximas Manutenções
      </h3>
      
      <div className="space-y-4">
        {upcomingMaintenances.map((order, index) => {
          const equipment = clientEquipments?.find(eq => eq.id === order.equipment_id);
          const technician = technicians?.find(tech => tech.id === order.technician_id);
          
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-evolutec-green transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-evolutec-black">
                      O.S. #{order.id.slice(-6)}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(order.priority)}`}>
                      {getMaintenanceTypeLabel(order.maintenance_type)}
                    </span>
                  </div>
                  <p className="text-sm text-evolutec-text mt-1">
                    {equipment?.name || 'Equipamento não informado'}
                  </p>
                  <p className="text-xs text-evolutec-text">
                    📍 {equipment?.installation_location || 'Local não informado'}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm text-evolutec-black">
                    <Calendar size={14} />
                    <span>{formatDate(order.scheduled_date!)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <User size={14} className="text-evolutec-green" />
                <span className="text-evolutec-text">{technician?.name || 'Técnico não atribuído'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardUpcomingMaintenance;
