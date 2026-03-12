import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useClientEquipments = (clientId?: string | null) => {
  return useQuery({
    queryKey: ['client-equipments', clientId],
    queryFn: async () => {
      console.log('🔍 Fetching equipments for client:', clientId);
      
      if (!clientId) {
        console.log('❌ No client ID provided');
        return [];
      }

      // Buscar via Edge Function para respeitar RLS e garantir acesso do cliente
      const accessCode = localStorage.getItem('clientAccessCode');

      const { data, error } = await supabase.functions.invoke('get-client-equipments', {
        body: {
          clientId,
          accessCode,
        },
      });

      if (error) {
        console.log('❌ Error fetching client equipments via function:', error);
        throw error;
      }

      const equipments = data?.equipments || [];

      
      if (error) {
        console.log('❌ Error fetching client equipments:', error);
        throw error;
      }
      
      console.log('✅ Client equipments fetched successfully:', equipments?.length || 0);
      return equipments || [];
    },
    enabled: !!clientId,
  });
};