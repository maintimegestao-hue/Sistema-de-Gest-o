
import { useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useUserSubscription } from '@/hooks/useSubscription';
import { usePlans } from '@/hooks/usePlans';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import CurrentSubscriptionCard from '@/components/subscription/CurrentSubscriptionCard';
import PlansGrid from '@/components/subscription/PlansGrid';
import SubscriptionInfo from '@/components/subscription/SubscriptionInfo';
import LoadingState from '@/components/subscription/LoadingState';

const Subscription = () => {
  const { data: subscription, isLoading: subscriptionLoading, refetch } = useUserSubscription();
  const { data: plans, isLoading: plansLoading } = usePlans();

  useEffect(() => {
    // Check subscription status on page load
    const checkSubscription = async () => {
      try {
        await supabase.functions.invoke('check-subscription');
        refetch();
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, [refetch]);

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error accessing customer portal:', error);
      toast.error('Erro ao acessar portal do cliente. Tente novamente.');
    }
  };

  if (subscriptionLoading || plansLoading) {
    return <LoadingState />;
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-evolutec-black">Assinatura</h1>
          <p className="text-evolutec-text">Gerencie sua assinatura e acesse recursos premium</p>
        </div>

        {subscription && (
          <CurrentSubscriptionCard 
            subscription={subscription} 
            onManageSubscription={handleManageSubscription}
          />
        )}

        <PlansGrid plans={plans || []} subscription={subscription} />

        <SubscriptionInfo />
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
