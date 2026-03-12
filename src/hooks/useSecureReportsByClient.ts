import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const fileToDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const reportSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  equipment_id: z.string().optional(),
  technician_id: z.string().optional(),
  report_date: z.string().optional(),
  attachment_url: z.string().optional(),
});

export const useSecureReportsByClient = (clientId?: string | null) => {
  return useQuery({
    queryKey: ['secure-reports-by-client', clientId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('reports')
        .select(`
          *,
          equipments(name, client_id, client),
          technicians(name, specialization, phone, email),
          clients(name, address, city, state, zip_code, phone, email, contact_person, cnpj)
        `)
        .eq('user_id', user.id);

      // Se um cliente específico foi selecionado, filtrar por ele
      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId, // Só executa a query se um cliente foi selecionado
  });
};

export const useCreateSecureReportByClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reportData: z.infer<typeof reportSchema> & { client_id: string; technician_signature?: string; client_signature?: string; photos?: (File | string)[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const validatedData = reportSchema.parse(reportData);
      
      // Converter fotos (File -> DataURL) se houver
      let photosData: string[] | null = null;
      if (reportData.photos && reportData.photos.length > 0) {
        const results = await Promise.all(
          reportData.photos.map(async (p) => (p instanceof File ? await fileToDataURL(p) : (p as string)))
        );
        photosData = results;
      }
      
      const { data, error } = await supabase
        .from('reports')
        .insert({
          title: validatedData.title,
          description: validatedData.description,
          equipment_id: validatedData.equipment_id,
          technician_id: validatedData.technician_id,
          report_date: validatedData.report_date || new Date().toISOString().split('T')[0],
          attachment_url: validatedData.attachment_url,
          client_id: reportData.client_id,
          user_id: user.id,
          technician_signature: reportData.technician_signature || null,
          client_signature: reportData.client_signature || null,
          photos: photosData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['secure-reports-by-client', variables.client_id] });
      toast.success('Relatório criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating report:', error);
      toast.error('Erro ao criar relatório. Tente novamente.');
    },
  });
};