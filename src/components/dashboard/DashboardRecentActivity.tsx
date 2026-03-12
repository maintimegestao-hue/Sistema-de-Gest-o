
import { Clock, User, Settings, CheckCircle } from "lucide-react";
import { useSecureMaintenanceOrdersByClient } from "@/hooks/useSecureMaintenanceOrdersByClient";
import { useSecureEquipments } from "@/hooks/useSecureEquipments";
import { useSecureTechnicians } from "@/hooks/useSecureTechnicians";
import { useClientContext } from "@/contexts/ClientContext";

const DashboardRecentActivity = () => {
  const { selectedClientId } = useClientContext();
  const { data: maintenanceOrders } = useSecureMaintenanceOrdersByClient(selectedClientId || '');
  const { data: equipments } = useSecureEquipments();
  const { data: technicians } = useSecureTechnicians();

  // Filtrar equipamentos pelo cliente selecionado
  const clientEquipments = equipments?.filter(eq => eq.client_id === selectedClientId) || [];

  // Pegar as últimas 3 atividades recentes, filtrando apenas equipamentos do cliente selecionado
  const recentActivities = maintenanceOrders
    ?.filter(order => {
      // Filtrar apenas ordens que têm equipamentos válidos do cliente selecionado
      if (!order.equipment_id) return false;
      const equipment = clientEquipments?.find(eq => eq.id === order.equipment_id);
      return equipment !== undefined;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)
    .map(order => {
      const equipment = clientEquipments?.find(eq => eq.id === order.equipment_id);
      const technician = technicians?.find(tech => tech.id === order.technician_id);
      
      // Como já filtramos, temos certeza que o equipamento existe
      let activityData = {
        icon: Clock,
        title: "Manutenção Agendada",
        description: `${equipment?.name || 'Equipamento'} - ${equipment?.installation_location || 'Local não informado'}`,
        user: technician?.name || 'Técnico não atribuído',
        time: getTimeAgo(order.created_at),
        type: "info" as "info" | "success" | "warning"
      };

      if (order.status === 'completed') {
        activityData = {
          ...activityData,
          icon: CheckCircle,
          title: "Manutenção Concluída",
          type: "success" as "info" | "success" | "warning"
        };
      } else if (order.status === 'in_progress') {
        activityData = {
          ...activityData,
          icon: Settings,
          title: "Manutenção em Andamento",
          type: "warning" as "info" | "success" | "warning"
        };
      }

      return activityData;
    }) || [];

  function getTimeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} dia${days > 1 ? 's' : ''} atrás`;
    }
  }

  if (!recentActivities.length) {
    return (
      <div className="evolutec-card">
        <h3 className="text-lg font-semibold text-evolutec-black mb-4">
          Atividades Recentes
        </h3>
        <div className="text-center py-8">
          <Clock size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-evolutec-text">Nenhuma atividade recente encontrada</p>
          <p className="text-sm text-evolutec-text mt-2">
            As atividades aparecerão aqui conforme você usar o sistema
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="evolutec-card">
      <h3 className="text-lg font-semibold text-evolutec-black mb-4">
        Atividades Recentes
      </h3>
      
      <div className="space-y-4">
        {recentActivities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-evolutec-gray/50">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              activity.type === 'success' ? 'bg-green-100' :
              activity.type === 'warning' ? 'bg-yellow-100' :
              'bg-blue-100'
            }`}>
              <activity.icon size={16} className={
                activity.type === 'success' ? 'text-green-600' :
                activity.type === 'warning' ? 'text-yellow-600' :
                'text-blue-600'
              } />
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-medium text-evolutec-black">
                {activity.title}
              </h4>
              <p className="text-sm text-evolutec-text">
                {activity.description}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-evolutec-text">
                  por {activity.user}
                </span>
                <span className="text-xs text-evolutec-text">
                  {activity.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardRecentActivity;
