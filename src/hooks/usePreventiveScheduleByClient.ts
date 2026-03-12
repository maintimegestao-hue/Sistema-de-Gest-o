import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PreventiveScheduleItem } from './usePreventiveSchedule';

export const usePreventiveScheduleByClient = (clientId: string, year: number = new Date().getFullYear()) => {
  return useQuery({
    queryKey: ['preventive_schedule_by_client', clientId, year],
    queryFn: async (): Promise<PreventiveScheduleItem[]> => {
      if (!clientId) {
        console.log('❌ ClientId não fornecido')
        return []
      }

      console.log('🔍 Buscando cronograma preventivo para cliente:', clientId, 'ano:', year)

      // Usar edge function para contornar RLS
      try {
        const { data: result, error } = await supabase.functions.invoke('get-client-preventive-schedule', {
          body: { clientId, year }
        })

        if (error) {
          console.error('❌ Erro na edge function:', error)
          throw error
        }

        console.log('✅ Cronograma obtido via edge function:', result?.data?.length || 0, 'registros')
        return (result?.data as PreventiveScheduleItem[]) || []
      } catch (error) {
        console.error('❌ Falha na edge function, tentando método direto:', error)
        
        // Fallback: busca direta (para admin)
        const { data: equipments, error: equipError } = await supabase
          .from('equipments')
          .select('id, user_id')
          .eq('client_id', clientId)
          .in('status', ['operational', 'active', 'maintenance'])

        if (equipError) throw equipError
        if (!equipments || equipments.length === 0) return []

        const equipmentIds = equipments.map(eq => eq.id)
        const { data: schedule, error: scheduleError } = await supabase
          .from('annual_preventive_schedule')
          .select(`
            *,
            equipment:equipments(
              name,
              installation_location,
              client,
              preventive_periodicity,
              status
            )
          `)
          .in('equipment_id', equipmentIds)
          .eq('year', year)
          .order('month', { ascending: true })

        if (scheduleError) throw scheduleError
        return (schedule as PreventiveScheduleItem[]) || []
      }
    },
    enabled: !!clientId, // Só executar se clientId estiver definido
  });
};

export const useGeneratePreventiveScheduleByClient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ clientId, year }: { clientId: string; year: number }) => {
      const { data: equipments, error: equipError } = await supabase
        .from('equipments')
        .select('id, preventive_periodicity, user_id, client_id')
        .eq('client_id', clientId)
        .in('status', ['operational', 'active', 'maintenance']);

      if (equipError) throw equipError;

      if (!equipments || equipments.length === 0) {
        throw new Error('Nenhum equipamento ativo encontrado para este cliente');
      }

      const { error: deleteError } = await supabase
        .from('annual_preventive_schedule')
        .delete()
        .eq('year', year)
        .in('equipment_id', equipments.map(eq => eq.id));

      if (deleteError) throw deleteError;

      const scheduleItems = [];
      for (const equipment of equipments) {
        const months = getMonthsForPeriodicity(equipment.preventive_periodicity);
        for (const month of months) {
          scheduleItems.push({
            user_id: equipment.user_id,
            equipment_id: equipment.id,
            year,
            month,
            due_date: new Date(year, month - 1, new Date(year, month, 0).getDate()).toISOString().split('T')[0],
            status: 'scheduled'
          });
        }
      }

      if (scheduleItems.length > 0) {
        const { error: insertError } = await supabase
          .from('annual_preventive_schedule')
          .insert(scheduleItems);
        if (insertError) throw insertError;
      }
      return scheduleItems;
    },
    onSuccess: (_, { clientId, year }) => {
      queryClient.invalidateQueries({ queryKey: ['preventive_schedule_by_client', clientId, year] });
      toast({ title: 'Sucesso!', description: 'Cronograma preventivo gerado com sucesso para o cliente.' });
    },
    onError: (error) => {
      toast({ title: 'Erro', description: 'Erro ao gerar cronograma: ' + error.message, variant: 'destructive' });
    },
  });
};

const getMonthsForPeriodicity = (periodicity: string): number[] => {
  // Mapeia meses conforme periodicidade padrão (início em janeiro)
  switch (periodicity) {
    case 'monthly':
      return [1,2,3,4,5,6,7,8,9,10,11,12];
    case 'bimonthly':
      return [1,3,5,7,9,11];
    case 'quarterly':
      return [1,4,7,10];
    case 'semestral':
      return [1,7];
    case 'annual':
      return [1];
    default:
      return [1,2,3,4,5,6,7,8,9,10,11,12];
  }
};