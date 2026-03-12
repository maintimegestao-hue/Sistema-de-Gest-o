import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useServiceCalls = (userId?: string) => {
  return useQuery({
    queryKey: ['service-calls', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_calls')
        .select(`
          *,
          equipments:equipment_id(name, client),
          clients:client_id(name)
        `)
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};