import { useMemo } from 'react';
import { useSecureEquipments } from '@/hooks/useSecureEquipments';
import { useSecureMaintenanceOrders } from '@/hooks/useSecureMaintenanceOrders';
import { useSecureMaintenanceOrdersByClient } from '@/hooks/useSecureMaintenanceOrdersByClient';
import { useClientContext } from '@/contexts/ClientContext';

export const useClientDashboardStats = () => {
  const { selectedClientId, isAllClients } = useClientContext();
  const { data: allEquipments } = useSecureEquipments();
  const { data: allMaintenanceOrders } = useSecureMaintenanceOrders();
  const { data: clientMaintenanceOrders } = useSecureMaintenanceOrdersByClient(selectedClientId || '');

  return useMemo(() => {
    console.log('🔄 Recalculando stats do dashboard para cliente:', selectedClientId);
    
    // Se nenhum cliente selecionado, return zeros
    if (!selectedClientId && !isAllClients) {
      console.log('❌ Nenhum cliente selecionado');
      return {
        totalEquipments: 0,
        activeEquipments: 0,
        awaitingCorrectiveMaintenance: 0,
        todayCorrectiveMaintenance: 0,
        todayPreventiveMaintenance: 0,
        monthlyCorrectiveMaintenance: 0,
        monthlyPreventiveMaintenance: 0,
        executedPercentage: 0,
        pendingPercentage: 0,
        overduePercentage: 0,
        waitingPercentage: 0
      };
    }

    // Determinar equipamentos e ordens baseado na seleção
    const equipments = isAllClients 
      ? allEquipments || []
      : (allEquipments || []).filter(eq => eq.client_id === selectedClientId);

    const maintenanceOrders = isAllClients 
      ? allMaintenanceOrders || []
      : clientMaintenanceOrders || [];

    console.log('📊 Dados carregados:', {
      selectedClientId,
      isAllClients,
      equipmentsCount: equipments.length,
      ordersCount: maintenanceOrders.length
    });

    // Calcular métricas básicas
    const totalEquipments = equipments.length;
    const activeEquipments = equipments.filter(eq => eq.status === 'operational').length;
    
    // Equipamentos aguardando manutenção corretiva
    const awaitingCorrectiveMaintenance = maintenanceOrders.filter(order => 
      order.maintenance_type === 'corrective' && 
      (order.status === 'pending' || order.status === 'in_progress')
    ).length;

    // Data atual para comparações
    const today = new Date().toDateString();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Manutenções hoje (usar created_at se scheduled_date for null)
    const todayOrders = maintenanceOrders.filter(order => {
      const orderDate = order.scheduled_date 
        ? new Date(order.scheduled_date).toDateString()
        : new Date(order.created_at).toDateString();
      return orderDate === today;
    });

    const todayCorrectiveMaintenance = todayOrders.filter(order => 
      order.maintenance_type === 'corrective'
    ).length;

    const todayPreventiveMaintenance = todayOrders.filter(order => 
      order.maintenance_type === 'preventive'
    ).length;

    // Manutenções do mês atual (usar created_at se scheduled_date for null)
    const monthlyOrders = maintenanceOrders.filter(order => {
      const orderDate = order.scheduled_date 
        ? new Date(order.scheduled_date)
        : new Date(order.created_at);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    const monthlyCorrectiveMaintenance = monthlyOrders.filter(order => 
      order.maintenance_type === 'corrective'
    ).length;

    const monthlyPreventiveMaintenance = monthlyOrders.filter(order => 
      order.maintenance_type === 'preventive'
    ).length;

    // Percentuais de status das manutenções
    const totalOrders = maintenanceOrders.length;
    
    const executedOrders = maintenanceOrders.filter(order => order.status === 'completed').length;
    const pendingOrders = maintenanceOrders.filter(order => order.status === 'pending').length;
    const inProgressOrders = maintenanceOrders.filter(order => order.status === 'in_progress').length;
    
    // Atrasadas (pendentes com data passada)
    const overdueOrders = maintenanceOrders.filter(order => {
      if (order.status !== 'pending' || !order.scheduled_date) return false;
      return new Date(order.scheduled_date) < new Date();
    }).length;

    const executedPercentage = totalOrders > 0 ? (executedOrders / totalOrders) * 100 : 0;
    const pendingPercentage = totalOrders > 0 ? (pendingOrders / totalOrders) * 100 : 0;
    const overduePercentage = totalOrders > 0 ? (overdueOrders / totalOrders) * 100 : 0;
    const waitingPercentage = totalOrders > 0 ? (inProgressOrders / totalOrders) * 100 : 0;

    const calculatedStats = {
      totalEquipments,
      activeEquipments,
      awaitingCorrectiveMaintenance,
      todayCorrectiveMaintenance,
      todayPreventiveMaintenance,
      monthlyCorrectiveMaintenance,
      monthlyPreventiveMaintenance,
      executedPercentage,
      pendingPercentage,
      overduePercentage,
      waitingPercentage
    };
    
    console.log('📊 Stats calculadas:', calculatedStats);
    return calculatedStats;
  }, [allEquipments, allMaintenanceOrders, clientMaintenanceOrders, selectedClientId, isAllClients]);
};