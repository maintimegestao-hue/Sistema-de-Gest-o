
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const maintenanceOrderSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  equipment_id: z.string().uuid("ID do equipamento inválido").optional(),
  technician_id: z.string().uuid("ID do técnico inválido").optional(),
  scheduled_date: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
  maintenance_type: z.enum(["preventive", "corrective", "predictive"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export const useSecureMaintenanceOrders = (clientId?: string | null) => {
  return useQuery({
    queryKey: ['secure-maintenance-orders', clientId],
    queryFn: async () => {
      console.log('🔍 Buscando manutenções para cliente:', clientId);
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('❌ Erro na autenticação:', authError);
          throw new Error('Erro na autenticação');
        }
        
        if (!user) {
          console.error('❌ Usuário não autenticado');
          throw new Error('User not authenticated');
        }

        console.log('👤 Usuário autenticado:', user.id);

        let query = supabase
          .from('maintenance_orders')
          .select(`
            *,
            equipments (name, installation_location, serial_number, client_id),
            technicians (name, email),
            clients (name)
          `)
          .eq('user_id', user.id);

        // Se um cliente específico foi selecionado, filtrar por ele
        if (clientId) {
          console.log('🔍 Filtrando por cliente:', clientId);
          query = query.eq('client_id', clientId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          console.error('❌ Erro ao buscar manutenções:', error);
          throw error;
        }
        
        console.log('✅ Manutenções encontradas:', data?.length || 0);
        console.log('📋 Dados das manutenções:', data);
        
        return data || [];
      } catch (error) {
        console.error('❌ Erro inesperado ao buscar manutenções:', error);
        throw error;
      }
    },
    // Configurações para evitar problemas de cache
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};

export const useCreateSecureMaintenanceOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: z.infer<typeof maintenanceOrderSchema>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const validatedData = maintenanceOrderSchema.parse(orderData);
      
      const { data, error } = await supabase
        .from('maintenance_orders')
        .insert({
          description: validatedData.description,
          equipment_id: validatedData.equipment_id,
          technician_id: validatedData.technician_id,
          scheduled_date: validatedData.scheduled_date,
          status: validatedData.status,
          maintenance_type: validatedData.maintenance_type,
          priority: validatedData.priority,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-maintenance-orders'] });
      toast.success('Ordem de manutenção criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating maintenance order:', error);
      toast.error('Erro ao criar ordem de manutenção. Tente novamente.');
    },
  });
};

export const useUpdateSecureMaintenanceOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...orderData }: { id: string } & Partial<z.infer<typeof maintenanceOrderSchema>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const validatedData = maintenanceOrderSchema.partial().parse(orderData);
      
      const updateData: Record<string, any> = {};
      if (validatedData.description !== undefined) updateData.description = validatedData.description;
      if (validatedData.equipment_id !== undefined) updateData.equipment_id = validatedData.equipment_id;
      if (validatedData.technician_id !== undefined) updateData.technician_id = validatedData.technician_id;
      if (validatedData.scheduled_date !== undefined) updateData.scheduled_date = validatedData.scheduled_date;
      if (validatedData.status !== undefined) updateData.status = validatedData.status;
      if (validatedData.maintenance_type !== undefined) updateData.maintenance_type = validatedData.maintenance_type;
      if (validatedData.priority !== undefined) updateData.priority = validatedData.priority;
      
      const { data, error } = await supabase
        .from('maintenance_orders')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-maintenance-orders'] });
      toast.success('Ordem de manutenção atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating maintenance order:', error);
      toast.error('Erro ao atualizar ordem de manutenção. Tente novamente.');
    },
  });
};

export const useDeleteSecureMaintenanceOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const { error } = await supabase
        .from('maintenance_orders')
        .delete()
        .eq('id', orderId)
        .eq('user_id', user.id);

      if (error) throw error;
      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-maintenance-orders'] });
      toast.success('Ordem de manutenção excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting maintenance order:', error);
      toast.error('Erro ao excluir ordem de manutenção. Tente novamente.');
    },
  });
};
