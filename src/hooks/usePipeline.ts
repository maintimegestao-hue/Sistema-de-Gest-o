import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export interface PipelineStage {
  id: string;
  user_id: string;
  name: string;
  stage_order: number;
  color: string;
  required_fields: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PipelineItem {
  id: string;
  user_id: string;
  service_proposal_id?: string;
  client_id: string;
  stage_id: string;
  title: string;
  description?: string;
  value: number;
  attachments: any[];
  stage_data: Record<string, any>;
  moved_at: string;
  created_at: string;
  updated_at: string;
  clients?: {
    id: string;
    name: string;
  };
  service_proposals?: {
    id: string;
    proposal_number: string;
    total_cost: number;
  };
}

export const usePipelineStages = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pipeline-stages', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('stage_order');

      if (error) throw error;
      return data as PipelineStage[];
    },
    enabled: !!user?.id,
  });
};

export const usePipelineItems = (clientId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pipeline-items', user?.id, clientId],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      let query = supabase
        .from('pipeline_items')
        .select(`
          *,
          clients:client_id (
            id,
            name
          ),
          service_proposals:service_proposal_id (
            id,
            proposal_number,
            total_cost
          )
        `)
        .eq('user_id', user.id);

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query.order('moved_at', { ascending: false });

      if (error) throw error;
      return (data || []) as any;
    },
    enabled: !!user?.id,
  });
};

export const useCreatePipelineItem = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (itemData: {
      client_id: string;
      stage_id: string;
      title: string;
      description?: string;
      value?: number;
      service_proposal_id?: string;
      stage_data?: Record<string, any>;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('pipeline_items')
        .insert({
          ...itemData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-items'] });
      toast.success('Item adicionado ao funil!');
    },
    onError: (error) => {
      console.error('Error creating pipeline item:', error);
      toast.error('Erro ao adicionar item ao funil');
    },
  });
};

export const useUpdatePipelineItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<PipelineItem>;
    }) => {
      const { data, error } = await supabase
        .from('pipeline_items')
        .update({
          ...updates,
          moved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-items'] });
      toast.success('Item atualizado!');
    },
    onError: (error) => {
      console.error('Error updating pipeline item:', error);
      toast.error('Erro ao atualizar item');
    },
  });
};

export const useMovePipelineItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      newStageId,
      stageData,
    }: {
      itemId: string;
      newStageId: string;
      stageData?: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .from('pipeline_items')
        .update({
          stage_id: newStageId,
          stage_data: stageData || {},
          moved_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-items'] });
      toast.success('Item movido com sucesso!');
    },
    onError: (error) => {
      console.error('Error moving pipeline item:', error);
      toast.error('Erro ao mover item. Verifique se todos os campos obrigatórios estão preenchidos.');
    },
  });
};