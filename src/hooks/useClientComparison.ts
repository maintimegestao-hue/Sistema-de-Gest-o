
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClientComparisonStats {
  client_id: string;
  client_name: string;
  total_equipments: number;
  monthly_orders: number;
  completed_on_time_percentage: number;
  overdue_maintenances: number;
  reports_generated: number;
  compliance_score: number;
}

export const useClientComparison = () => {
  return useQuery({
    queryKey: ['client-comparison'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_client_comparison_stats');
      
      if (error) throw error;
      return data as ClientComparisonStats[];
    },
  });
};
