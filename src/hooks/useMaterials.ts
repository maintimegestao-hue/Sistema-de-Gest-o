
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Material {
  id: string;
  user_id: string;
  name: string;
  internal_code?: string;
  category?: string;
  unit_of_measure?: string;
  brand?: string;
  model?: string;
  technical_description?: string;
  unit_price?: number;
  stock_quantity?: number;
  physical_location?: string;
  supplier_id?: string;
  supplier?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export const useMaterials = () => {
  return useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materials')
        .select(`
          *,
          supplier:suppliers(id, name)
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('name');
      
      if (error) {
        toast.error('Erro ao carregar materiais');
        throw error;
      }
      
      return data as Material[];
    },
  });
};

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (material: Omit<Material, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'supplier'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('materials')
        .insert({
          ...material,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('✅ Material criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar material:', error);
      toast.error('❌ Erro ao criar material');
    },
  });
};

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, supplier, ...material }: Partial<Material> & { id: string }) => {
      const { data, error } = await supabase
        .from('materials')
        .update(material)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('✅ Material atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar material:', error);
      toast.error('❌ Erro ao atualizar material');
    },
  });
};

export const useDeleteMaterial = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success('✅ Material excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir material:', error);
      toast.error('❌ Erro ao excluir material');
    },
  });
};
