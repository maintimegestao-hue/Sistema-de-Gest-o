import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFieldEquipments = (clientId?: string | null) => {
  return useQuery({
    queryKey: ['field-equipments', clientId],
    queryFn: async () => {
      console.log('🔍 Fetching equipments for field technicians, client:', clientId);
      
      try {
        // Buscar equipamentos disponíveis
        const { data, error } = await supabase
          .rpc('get_all_equipments_for_field');
        
        if (error) {
          console.error('❌ Error fetching field equipments:', error);
          return [];
        }

        // Verificar se existe sessão de técnico de campo ativa
        const fieldSession = localStorage.getItem('field_session');
        let equipmentsWithMaintenance = new Set();
        
        if (fieldSession) {
          const session = JSON.parse(fieldSession);
          const technicianId = session.technician_id;
          
          if (technicianId) {
            console.log('🔧 Técnico de campo logado:', technicianId);
            
            // Buscar equipamentos que este técnico já fez manutenção preventiva hoje
            const { data: maintainedToday, error: maintainedError } = await supabase
              .rpc('get_maintained_equipment_ids_today_for_field', { technician_id: technicianId });
            
            if (maintainedError) {
              console.error('❌ Error fetching maintained equipments for today:', maintainedError);
            } else {
              equipmentsWithMaintenance = new Set(
                maintainedToday?.map((item: any) => item.equipment_id) || []
              );
              console.log('📅 Equipamentos com manutenção preventiva hoje pelo técnico:', equipmentsWithMaintenance.size);
            }
          }
        }
        
        // Filtrar equipamentos que não tiveram manutenção preventiva hoje pelo técnico logado
        let filteredData = (data || []).filter((equipment: any) => 
          !equipmentsWithMaintenance.has(equipment.id)
        );
        
        // Se um cliente específico foi selecionado, filtrar por ele
        if (clientId && clientId !== 'all') {
          console.log('🔍 Filtering by client:', clientId);
          
          // Buscar o nome do cliente para filtrar
          const { data: clientData } = await supabase
            .rpc('get_all_clients_for_field');
          
          const client = clientData?.find((c: any) => c.id === clientId);
          
          if (client) {
            console.log('✅ Client found for filtering:', client.name);
            // Filtrar por client_id OU pelo nome do cliente
            filteredData = filteredData.filter((eq: any) => 
              eq.client_id === clientId || eq.client === client.name
            );
          } else {
            // Se não encontrou o cliente, filtrar apenas por client_id
            filteredData = filteredData.filter((eq: any) => eq.client_id === clientId);
          }
        }
        
        console.log('✅ Field equipments fetched successfully:', filteredData?.length || 0);
        console.log('🚫 Equipamentos disponíveis (sem manutenção preventiva hoje):', filteredData?.length || 0);
        console.log('📊 Equipments data preview:', filteredData?.slice(0, 3));
        return filteredData || [];
      } catch (err) {
        console.error('❌ Critical error in useFieldEquipments:', err);
        return [];
      }
    },
    enabled: true, // Sempre habilitado para técnicos de campo
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};