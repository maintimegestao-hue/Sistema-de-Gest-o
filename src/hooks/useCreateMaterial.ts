import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MaterialData {
  name: string;
  internal_code?: string;
  category?: string;
  unit_of_measure?: string;
  brand?: string;
  model?: string;
  technical_description?: string;
  supplier?: string;
  physical_location?: string;
  photo_url?: string;
  stock_quantity?: number;
  unit_price?: number;
  supplier_id?: string;
}

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (material: MaterialData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('materials')
        .insert([
          {
            ...material,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({
        title: 'Sucesso!',
        description: 'Material criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar material: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};