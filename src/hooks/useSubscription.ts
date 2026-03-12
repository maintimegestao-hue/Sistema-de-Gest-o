
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserProfile } from "./useUserProfile";

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
  plans?: {
    name: string;
    price: number;
    max_equipments: number;
    max_technicians: number;
  };
}

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  trial_end?: string;
  days_remaining?: number;
  trial_expired?: boolean;
}

export const useSubscription = () => {
  const { data: userProfile } = useUserProfile();
  
  return useQuery({
    queryKey: ['subscription-status', userProfile?.user_id],
    queryFn: async (): Promise<SubscriptionStatus> => {
      // Para admins, verificar trial no subscribers table
      if (userProfile?.role === 'admin') {
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', userProfile.user_id)
          .single();

        if (subscriber) {
          const now = new Date();
          const trialEnd = subscriber.trial_end ? new Date(subscriber.trial_end) : null;
          const isTrialExpired = trialEnd ? now > trialEnd : false;
          const daysRemaining = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

          // Se tem assinatura ativa (subscribed = true), acesso completo
          if (subscriber.subscribed) {
            return {
              subscribed: true,
              subscription_tier: subscriber.subscription_tier || 'enterprise',
              subscription_end: subscriber.subscription_end,
              trial_end: undefined,
              days_remaining: undefined,
              trial_expired: false,
            };
          }

          // Se está em trial, limitado ao básico
          return {
            subscribed: false,
            subscription_tier: 'basic', // Limitado ao básico durante trial
            subscription_end: undefined,
            trial_end: subscriber.trial_end,
            days_remaining: daysRemaining,
            trial_expired: isTrialExpired,
          };
        }
      }
      
      // Fallback para check-subscription function
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        throw error;
      }
      
      return data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute para trial
    refetchOnWindowFocus: true,
    enabled: !!userProfile,
  });
};

export const useUserSubscription = () => {
  return useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans (
            name,
            price,
            max_equipments,
            max_technicians
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as Subscription | null;
    },
  });
};

export const useStripeCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, priceAmount }: { planId: string; priceAmount: number }) => {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { planId, priceAmount }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Abrir checkout do Stripe em nova aba
      window.open(data.url, '_blank');
      
      // Invalidar cache de subscription para refresh quando usuário voltar
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      }, 1000);
    },
    onError: (error: any) => {
      toast.error('Erro ao criar sessão de checkout: ' + error.message);
    },
  });
};

export const useCustomerPortal = () => {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      window.open(data.url, '_blank');
    },
    onError: (error: any) => {
      toast.error('Erro ao acessar portal do cliente: ' + error.message);
    },
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ planId }: { planId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: 'pending',
          trial_start: new Date().toISOString(),
          trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days trial
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      toast.success('Assinatura criada com sucesso! Teste gratuito de 7 dias ativado.');
    },
    onError: (error) => {
      console.error('Error creating subscription:', error);
      toast.error('Erro ao criar assinatura. Tente novamente.');
    },
  });
};
