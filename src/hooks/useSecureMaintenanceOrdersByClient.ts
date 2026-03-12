import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const maintenanceOrderSchema = z.object({
  equipment_id: z.string().min(1, "Equipamento é obrigatório"),
  technician_id: z.string().optional(),
  description: z.string().min(1, "Descrição é obrigatória"),
  priority: z.enum(["low", "medium", "high"]).optional(),
  maintenance_type: z.enum(["preventive", "corrective", "predictive"]).optional(),
  scheduled_date: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
});

export const useSecureMaintenanceOrdersByClient = (clientId?: string | null) => {
  return useQuery({
    queryKey: ['secure-maintenance-orders-by-client', clientId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('maintenance_orders')
        .select(`
          *,
          equipments(name, installation_location, client_id),
          technicians(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Filtrar por cliente considerando ordens antigas sem client_id definido
      const filtered = (data || []).filter((order: any) => {
        if (!clientId) return false;
        return order.client_id === clientId || order.equipments?.client_id === clientId;
      });

      return filtered;
    },
    enabled: !!clientId, // Só executa a query se um cliente foi selecionado
  });
};

export const useCreateSecureMaintenanceOrderByClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: z.infer<typeof maintenanceOrderSchema> & { client_id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const validatedData = maintenanceOrderSchema.parse(orderData);
      
      const { data, error } = await supabase
        .from('maintenance_orders')
        .insert({
          equipment_id: validatedData.equipment_id,
          technician_id: validatedData.technician_id,
          description: validatedData.description,
          priority: validatedData.priority || 'medium',
          maintenance_type: validatedData.maintenance_type || 'preventive',
          scheduled_date: validatedData.scheduled_date,
          status: validatedData.status || 'pending',
          client_id: orderData.client_id,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['secure-maintenance-orders-by-client', variables.client_id] });
      toast.success('Ordem de manutenção criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating maintenance order:', error);
      toast.error('Erro ao criar ordem de manutenção. Tente novamente.');
    },
  });
};