
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

export const useDeleteServiceProposal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalId: string) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Excluindo proposta:', proposalId);

      const { error } = await supabase
        .from('service_proposals')
        .delete()
        .eq('id', proposalId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao excluir proposta:', error);
        throw new Error(error.message);
      }

      return proposalId;
    },
    onSuccess: () => {
      // Invalidar cache para recarregar a lista
      queryClient.invalidateQueries({ queryKey: ['service_proposals'] });
      toast.success('✅ Proposta excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir proposta:', error);
      toast.error('❌ Erro ao excluir proposta. Tente novamente.');
    },
  });
};
