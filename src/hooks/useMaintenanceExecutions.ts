import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MaintenanceExecution {
  id: string;
  user_id: string;
  equipment_id: string;
  maintenance_order_id?: string;
  technician_signature: string;
  digital_signature: string;
  observations: string;
  maintenance_type: string;
  periodicity?: string;
  checklist_items: any;
  attachments: any;
  start_datetime: string;
  end_datetime: string;
  created_at: string;
  updated_at: string;
  equipments?: {
    name: string;
    installation_location: string;
  };
}

export const useMaintenanceExecutions = () => {
  return useQuery({
    queryKey: ['maintenance-executions'],
    queryFn: async (): Promise<MaintenanceExecution[]> => {
      const { data, error } = await supabase
        .from('maintenance_executions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar execuções de manutenção:', error);
        throw error;
      }
      
      const executions = (data || []) as unknown as MaintenanceExecution[];

      // Buscar detalhes dos equipamentos separadamente (não há FK definida)
      const equipmentIds = Array.from(new Set(executions.map(e => e.equipment_id).filter(Boolean))) as string[];
      if (equipmentIds.length > 0) {
        const { data: equipmentsData, error: equipErr } = await supabase
          .from('equipments')
          .select('id, name, installation_location')
          .in('id', equipmentIds);
        if (!equipErr && equipmentsData) {
          const map = new Map(
            (equipmentsData as any[]).map(e => [e.id, { name: e.name, installation_location: e.installation_location }])
          );
          executions.forEach(exec => {
            const info = map.get(exec.equipment_id);
            if (info) {
              (exec as any).equipments = info;
            }
          });
        } else if (equipErr) {
          console.warn('Não foi possível buscar detalhes dos equipamentos:', equipErr);
        }
      }

      return executions;
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchOnWindowFocus: true,
  });
};