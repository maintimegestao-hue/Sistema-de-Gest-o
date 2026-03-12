import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useCreateServiceCall = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (serviceCallData: any) => {
      const { data, error } = await supabase.functions.invoke('create-service-call', {
        body: serviceCallData,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidar todas as queries relacionadas aos service calls
      queryClient.invalidateQueries({ queryKey: ['service-calls'] });
      queryClient.invalidateQueries({ queryKey: ['client-service-calls'] });
      
      toast({
        title: "Chamado criado com sucesso!",
        description: `Chamado ${data.call_number} foi aberto.`,
      });
    },
    onError: (error: any) => {
      console.error('Erro ao criar chamado:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar chamado",
        description: error.message || "Ocorreu um erro inesperado.",
      });
    },
  });
};