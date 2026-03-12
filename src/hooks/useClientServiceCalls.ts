import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientServiceCalls = (clientId?: string, accessCode?: string) => {
  return useQuery({
    queryKey: ['client-service-calls', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data, error } = await supabase.functions.invoke('get-client-service-calls', {
        body: { clientId, accessCode },
      });

      if (error) {
        console.error('Error fetching client service calls:', error);
        throw error;
      }

      return data?.data || [];
    },
    enabled: !!clientId,
  });
};