
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Service {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  service_type?: string;
  base_price?: number;
  estimated_time?: number;
  complexity_level?: string;
  recommended_team?: string;
  supplier_id?: string;
  supplier?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          supplier:suppliers(id, name)
        `)
        .order('name');
      
      if (error) {
        toast.error('Erro ao carregar serviços');
        throw error;
      }
      
      return data as Service[];
    },
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (service: Omit<Service, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'supplier'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('services')
        .insert({
          ...service,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('✅ Serviço criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar serviço:', error);
      toast.error('❌ Erro ao criar serviço');
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, supplier, ...service }: Partial<Service> & { id: string }) => {
      const { data, error } = await supabase
        .from('services')
        .update(service)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('✅ Serviço atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar serviço:', error);
      toast.error('❌ Erro ao atualizar serviço');
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('✅ Serviço excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir serviço:', error);
      toast.error('❌ Erro ao excluir serviço');
    },
  });
};
