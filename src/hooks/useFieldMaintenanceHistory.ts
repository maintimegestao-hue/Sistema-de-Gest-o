import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FieldMaintenanceHistory {
  id: string;
  equipment_id: string;
  equipment_name: string;
  client_name: string;
  description: string;
  maintenance_type: string;
  status: string;
  scheduled_date: string;
  created_at: string;
  updated_at: string;
  execution_id?: string;
  observations?: string;
  checklist_items?: any;
  attachments?: any;
  technician_signature?: string;
  digital_signature?: string;
}

export const useFieldMaintenanceHistory = () => {
  return useQuery({
    queryKey: ['field-maintenance-history'],
    queryFn: async (): Promise<FieldMaintenanceHistory[]> => {
      console.log('🔍 Buscando histórico de manutenções do campo...');
      
      const { data, error } = await supabase.rpc('get_maintenance_history_for_field');
      
      if (error) {
        console.error('❌ Erro ao buscar histórico:', error);
        throw error;
      }
      
      console.log('✅ Histórico de manutenções encontrado:', data);
      return (data || []).map((item: any) => ({
        ...item,
        checklist_items: Array.isArray(item.checklist_items) ? item.checklist_items : 
          (item.checklist_items && typeof item.checklist_items === 'string' ? 
            JSON.parse(item.checklist_items) : []),
        attachments: Array.isArray(item.attachments) ? item.attachments : 
          (item.attachments && typeof item.attachments === 'string' ? 
            JSON.parse(item.attachments) : [])
      }));
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchOnWindowFocus: true,
  });
};