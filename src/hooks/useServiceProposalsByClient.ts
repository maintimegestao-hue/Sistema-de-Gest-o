import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const serviceProposalSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  scope_of_work: z.string().min(1, "Escopo do trabalho é obrigatório"),
  equipment_id: z.string().optional(),
  materials: z.array(z.any()).optional(),
  labor_cost: z.number().min(0).optional(),
  materials_cost: z.number().min(0).optional(),
  total_cost: z.number().min(0).optional(),
  estimated_duration: z.number().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  validity_days: z.number().optional(),
  terms_and_conditions: z.string().optional(),
  notes: z.string().optional(),
});

export const useServiceProposalsByClient = (clientId?: string | null) => {
  return useQuery({
    queryKey: ['service-proposals-by-client', clientId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('service_proposals')
        .select(`
          id, title, status, proposal_number, total_cost, created_at, validity_days,
          equipments(name)
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
    staleTime: 60_000, // 1 min cache para melhorar performance
    gcTime: 5 * 60_000, // 5 min de cache no garbage collector
    refetchOnWindowFocus: false,
  });
};

export const useCreateServiceProposalByClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (proposalData: z.infer<typeof serviceProposalSchema> & { client_id: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const validatedData = serviceProposalSchema.parse(proposalData);
      
      // Gerar número da proposta
      const proposalNumber = `PROP-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('service_proposals')
        .insert({
          title: validatedData.title,
          description: validatedData.description,
          scope_of_work: validatedData.scope_of_work,
          equipment_id: validatedData.equipment_id,
          materials: validatedData.materials || [],
          labor_cost: validatedData.labor_cost || 0,
          materials_cost: validatedData.materials_cost || 0,
          total_cost: validatedData.total_cost || 0,
          estimated_duration: validatedData.estimated_duration,
          start_date: validatedData.start_date,
          end_date: validatedData.end_date,
          validity_days: validatedData.validity_days || 30,
          terms_and_conditions: validatedData.terms_and_conditions,
          notes: validatedData.notes,
          client_id: proposalData.client_id,
          user_id: user.id,
          proposal_number: proposalNumber,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service-proposals-by-client', variables.client_id] });
      toast.success('Proposta de serviço criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating service proposal:', error);
      toast.error('Erro ao criar proposta de serviço. Tente novamente.');
    },
  });
};