
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const reportSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  equipment_id: z.string().optional().refine((val) => !val || val.length > 0, "ID do equipamento inválido"),
  technician_id: z.string().optional().refine((val) => !val || val.length > 0, "ID do técnico inválido"),
  client_id: z.string().optional().refine((val) => !val || val.length > 0, "ID do cliente inválido"),
  report_date: z.string().optional(),
  attachment_url: z.string().optional().refine((val) => !val || val.startsWith('http'), "URL do anexo inválida"),
});

export const useSecureReports = () => {
  return useQuery({
    queryKey: ['secure-reports'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          equipments (name),
          technicians (name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateSecureReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reportData: z.infer<typeof reportSchema>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const validatedData = reportSchema.parse(reportData);
      
      const { data, error } = await supabase
        .from('reports')
        .insert({
          title: validatedData.title,
          description: validatedData.description,
          equipment_id: validatedData.equipment_id,
          technician_id: validatedData.technician_id,
          client_id: validatedData.client_id,
          report_date: validatedData.report_date,
          attachment_url: validatedData.attachment_url,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidar múltiplas queries para garantir atualização
      queryClient.invalidateQueries({ queryKey: ['secure-reports'] });
      queryClient.invalidateQueries({ queryKey: ['secure-reports-by-client'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      
      // Forçar refetch imediato
      queryClient.refetchQueries({ queryKey: ['secure-reports'] });
      
      console.log('✅ Relatório criado e queries invalidadas:', data);
      toast.success('Relatório criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating report:', error);
      toast.error('Erro ao criar relatório. Tente novamente.');
    },
  });
};

export const useUpdateSecureReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...reportData }: { id: string } & Partial<z.infer<typeof reportSchema>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const validatedData = reportSchema.partial().parse(reportData);
      
      const updateData: Record<string, any> = {};
      if (validatedData.title !== undefined) updateData.title = validatedData.title;
      if (validatedData.description !== undefined) updateData.description = validatedData.description;
      if (validatedData.equipment_id !== undefined) updateData.equipment_id = validatedData.equipment_id;
      if (validatedData.technician_id !== undefined) updateData.technician_id = validatedData.technician_id;
      if (validatedData.report_date !== undefined) updateData.report_date = validatedData.report_date;
      if (validatedData.attachment_url !== undefined) updateData.attachment_url = validatedData.attachment_url;
      
      const { data, error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-reports'] });
      toast.success('Relatório atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating report:', error);
      toast.error('Erro ao atualizar relatório. Tente novamente.');
    },
  });
};

export const useDeleteSecureReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-reports'] });
      toast.success('Relatório excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting report:', error);
      toast.error('Erro ao excluir relatório. Tente novamente.');
    },
  });
};
