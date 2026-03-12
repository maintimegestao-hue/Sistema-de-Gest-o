import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const fieldTechnicianSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
});

export interface FieldTechnician {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  access_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useFieldTechnicians = () => {
  return useQuery({
    queryKey: ['field-technicians'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('field_technicians')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FieldTechnician[];
    },
  });
};

export const useCreateFieldTechnician = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (technicianData: z.infer<typeof fieldTechnicianSchema>) => {
      console.log('🔧 Iniciando criação de técnico:', technicianData);
      const validatedData = fieldTechnicianSchema.parse(technicianData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Gerar código de acesso único
      const accessCode = `TECH-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      console.log('🔑 Código de acesso gerado:', accessCode);

      const insertData = {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        user_id: user.id,
        access_code: accessCode,
      };

      console.log('📝 Dados para inserção:', insertData);

      const { data, error } = await supabase
        .from('field_technicians')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro na inserção:', error);
        throw error;
      }
      
      console.log('✅ Técnico criado com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-technicians'] });
      toast({
        title: 'Sucesso!',
        description: 'Técnico de campo criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar técnico de campo: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateFieldTechnician = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, technicianData }: { 
      id: string; 
      technicianData: Partial<z.infer<typeof fieldTechnicianSchema>> & { is_active?: boolean }
    }) => {
      const validatedData = fieldTechnicianSchema.partial().parse(technicianData);
      
      const { data, error } = await supabase
        .from('field_technicians')
        .update(validatedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-technicians'] });
      toast({
        title: 'Sucesso!',
        description: 'Técnico de campo atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar técnico de campo: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteFieldTechnician = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('field_technicians')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-technicians'] });
      toast({
        title: 'Sucesso!',
        description: 'Técnico de campo removido com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao remover técnico de campo: ' + error.message,
        variant: 'destructive',
      });
    },
  });
};