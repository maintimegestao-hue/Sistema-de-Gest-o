
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStripeCheckout = () => {
  return useMutation({
    mutationFn: async ({ planId, priceAmount }: { planId: string; priceAmount: number }) => {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { planId, priceAmount },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      console.error('Error creating checkout session:', error);
      toast.error('Erro ao criar sessão de pagamento. Tente novamente.');
    },
  });
};
