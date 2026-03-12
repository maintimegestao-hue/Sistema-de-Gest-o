
import { Plan } from '@/hooks/usePlans';
import { Subscription } from '@/hooks/useSubscription';
import PlanCard from './PlanCard';

interface PlansGridProps {
  plans: Plan[];
  subscription: Subscription | null;
}

const PlansGrid = ({ plans, subscription }: PlansGridProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-evolutec-black mb-4">
        {subscription ? 'Alterar Plano' : 'Escolha seu Plano'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans?.map((plan) => {
          const isCurrentPlan = subscription?.plan_id === plan.id;
          const isHighlighted = plan.name === 'Professional';
          const isEnterprise = plan.name === 'Enterprise';
          
          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={isCurrentPlan}
              isHighlighted={isHighlighted}
              isEnterprise={isEnterprise}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PlansGrid;
