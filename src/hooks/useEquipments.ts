
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Equipment {
  id: string;
  name: string;
  serial_number?: string;
  installation_location?: string;
  client?: string;
  status: string;
  qr_code?: string;
  created_at: string;
  updated_at: string;
}

export const useEquipments = () => {
  return useQuery({
    queryKey: ['equipments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Equipment[];
    },
  });
};

export const useCreateEquipment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Gerar QR Code único
      const qrCode = `EQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { data, error } = await supabase
        .from('equipments')
        .insert([
          {
            ...equipment,
            user_id: user.id,
            qr_code: qrCode,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipments'] });
      toast({
        title: 'Sucesso!',
        description: 'Equipamento criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar equipamento: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};
