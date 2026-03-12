
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MaintenanceOrder {
  id: string;
  equipment_id?: string;
  technician_id?: string;
  description: string;
  priority: string;
  maintenance_type: string;
  scheduled_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useMaintenanceOrders = () => {
  return useQuery({
    queryKey: ['maintenance_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_orders')
        .select(`
          *,
          equipments(name, installation_location),
          technicians(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateMaintenanceOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (order: Omit<MaintenanceOrder, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('maintenance_orders')
        .insert([
          {
            ...order,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_orders'] });
      toast({
        title: 'Sucesso!',
        description: 'Manutenção registrada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao registrar manutenção: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};
