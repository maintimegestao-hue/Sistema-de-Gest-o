import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFieldClients = () => {
  return useQuery({
    queryKey: ['field-clients'],
    queryFn: async () => {
      console.log('🔍 Fetching all clients for field technicians...');
      
      try {
        // Usar a função específica para técnicos de campo que não tem RLS
        const { data, error } = await supabase
          .rpc('get_all_clients_for_field');
        
        if (error) {
          console.error('❌ Error fetching field clients:', error);
          
          // Fallback: tentar buscar diretamente da tabela
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('clients')
            .select('*')
            .eq('status', 'active')
            .order('name', { ascending: true });
          
          if (fallbackError) {
            console.error('❌ Fallback error:', fallbackError);
            return [];
          }
          
          console.log('✅ Fallback clients fetched:', fallbackData?.length || 0);
          return fallbackData || [];
        }
        
        console.log('✅ Field clients fetched successfully:', data?.length || 0);
        console.log('📊 Clients data preview:', data?.slice(0, 3));
        return data || [];
      } catch (err) {
        console.error('❌ Critical error in useFieldClients:', err);
        return [];
      }
    },
    enabled: true,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};