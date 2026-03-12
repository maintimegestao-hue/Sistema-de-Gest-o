
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const technicianSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  status: z.enum(["available", "busy", "inactive"]).optional(),
});

export const useSecureTechnicians = () => {
  return useQuery({
    queryKey: ['secure-technicians'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateSecureTechnician = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (technicianData: z.infer<typeof technicianSchema>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const validatedData = technicianSchema.parse(technicianData);
      
      const { data, error } = await supabase
        .from('technicians')
        .insert({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          specialization: validatedData.specialization,
          status: validatedData.status,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-technicians'] });
      toast.success('Técnico criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating technician:', error);
      toast.error('Erro ao criar técnico. Tente novamente.');
    },
  });
};

export const useUpdateSecureTechnician = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...technicianData }: { id: string } & Partial<z.infer<typeof technicianSchema>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const validatedData = technicianSchema.partial().parse(technicianData);
      
      const updateData: Record<string, any> = {};
      if (validatedData.name !== undefined) updateData.name = validatedData.name;
      if (validatedData.email !== undefined) updateData.email = validatedData.email;
      if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;
      if (validatedData.specialization !== undefined) updateData.specialization = validatedData.specialization;
      if (validatedData.status !== undefined) updateData.status = validatedData.status;
      
      const { data, error } = await supabase
        .from('technicians')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-technicians'] });
      toast.success('Técnico atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating technician:', error);
      toast.error('Erro ao atualizar técnico. Tente novamente.');
    },
  });
};

export const useDeleteSecureTechnician = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const { error } = await supabase
        .from('technicians')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-technicians'] });
      toast.success('Técnico excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting technician:', error);
      toast.error('Erro ao excluir técnico. Tente novamente.');
    },
  });
};
