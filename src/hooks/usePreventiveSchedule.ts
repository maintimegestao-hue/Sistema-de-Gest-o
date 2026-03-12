
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PreventiveScheduleItem {
  id: string;
  equipment_id: string;
  year: number;
  month: number;
  status: 'scheduled' | 'pending' | 'completed' | 'overdue';
  due_date: string;
  completed_date?: string;
  maintenance_order_id?: string;
  equipment?: {
    name: string;
    installation_location?: string;
    client?: string;
    preventive_periodicity?: string;
    status?: string;
  };
}

export const usePreventiveSchedule = (year: number = new Date().getFullYear()) => {
  return useQuery({
    queryKey: ['preventive_schedule', year],
    queryFn: async () => {
      const { data, error } = await supabase
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
        .eq('year', year)
        .order('month', { ascending: true });
      
      if (error) throw error;
      
      // Filtrar apenas equipamentos ativos
      const filteredData = (data as PreventiveScheduleItem[]).filter(
        item => ['operational', 'active', 'maintenance'].includes(item.equipment?.status || '')
      );
      
      return filteredData;
    },
  });
};

export const useGeneratePreventiveSchedule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (year: number = new Date().getFullYear()) => {
      // Primeiro, buscar todos os equipamentos ativos
      const { data: equipments, error: equipError } = await supabase
        .from('equipments')
        .select('id, preventive_periodicity, user_id')
        .in('status', ['operational', 'active', 'maintenance']);

      if (equipError) throw equipError;

      // Limpar cronograma existente para o ano
      const { error: deleteError } = await supabase
        .from('annual_preventive_schedule')
        .delete()
        .eq('year', year);

      if (deleteError) throw deleteError;

      // Gerar cronograma baseado na periodicidade para cada equipamento
      const scheduleItems = [];

      for (const equipment of equipments || []) {
        const months = getMonthsForPeriodicity(equipment.preventive_periodicity);
        
        for (const month of months) {
          const dueDate = new Date(year, month - 1, 
            new Date(year, month, 0).getDate() // Último dia do mês
          ).toISOString().split('T')[0];

          const currentDate = new Date();
          const itemDate = new Date(year, month - 1, 1);
          
          let status = 'scheduled';
          if (itemDate < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)) {
            status = 'overdue';
          } else if (itemDate.getFullYear() === currentDate.getFullYear() && 
                     itemDate.getMonth() === currentDate.getMonth()) {
            status = 'pending';
          }

          scheduleItems.push({
            user_id: equipment.user_id,
            equipment_id: equipment.id,
            year,
            month,
            due_date: dueDate,
            status
          });
        }
      }

      if (scheduleItems.length > 0) {
        const { error: insertError } = await supabase
          .from('annual_preventive_schedule')
          .insert(scheduleItems);

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preventive_schedule'] });
      toast({
        title: 'Sucesso!',
        description: 'Cronograma preventivo gerado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao gerar cronograma: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};

// Função auxiliar para determinar os meses baseados na periodicidade
const getMonthsForPeriodicity = (periodicity: string): number[] => {
  switch (periodicity) {
    case 'monthly':
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    case 'quarterly':
      return [1, 4, 7, 10]; // Jan, Abr, Jul, Out
    case 'semestral':
      return [1, 7]; // Jan, Jul
    case 'annual':
      return [1]; // Jan
    case 'bimonthly':
      return [1, 3, 5, 7, 9, 11]; // Bimestral
    default:
      return [1]; // Default anual
  }
};

export const useUpdateScheduleStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, completed_date }: { 
      id: string; 
      status: string; 
      completed_date?: string 
    }) => {
      const { error } = await supabase
        .from('annual_preventive_schedule')
        .update({ 
          status, 
          completed_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preventive_schedule'] });
      toast({
        title: 'Sucesso!',
        description: 'Status atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};
