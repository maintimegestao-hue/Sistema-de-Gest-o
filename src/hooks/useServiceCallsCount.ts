import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useServiceCallsCount = (userId?: string) => {
  return useQuery({
    queryKey: ['service-calls-count', userId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('service_calls')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId!)
        .in('status', ['open', 'in_progress']);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!userId,
  });
};