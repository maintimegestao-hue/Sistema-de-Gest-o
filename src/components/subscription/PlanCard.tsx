
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown } from 'lucide-react';
import { Plan } from '@/hooks/usePlans';
import { PricingButton } from '@/components/pricing/PricingButton';
import { useAdminAccess } from '@/hooks/useAdminAccess';

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  isHighlighted: boolean;
  isEnterprise: boolean;
}

const PlanCard = ({ plan, isCurrentPlan, isHighlighted, isEnterprise }: PlanCardProps) => {
  const { isAdmin } = useAdminAccess();
  
  return (
    <Card 
      className={`relative ${
        isCurrentPlan 
          ? 'ring-2 ring-evolutec-green' 
          : isHighlighted 
            ? 'ring-2 ring-evolutec-green/50' 
            : ''
      }`}
    >
      {isAdmin && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center gap-1">
            <Crown size={12} />
            Acesso Admin Total
          </Badge>
        </div>
      )}
      
      {!isAdmin && isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-evolutec-green text-white">
            Plano Atual
          </Badge>
        </div>
      )}
      
      {!isAdmin && isHighlighted && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-evolutec-green text-white">
            Mais Popular
          </Badge>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>
          {plan.name === 'Starter' && 'Ideal para pequenas empresas'}
          {plan.name === 'Professional' && 'Para empresas em crescimento'}
          {plan.name === 'Enterprise' && 'Solução completa para grandes operações'}
        </CardDescription>
        <div className="text-3xl font-bold text-evolutec-black">
          R$ {plan.price.toFixed(0)}
          <span className="text-lg font-normal text-evolutec-text">/mês</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="font-semibold text-sm text-evolutec-text">Limites:</p>
          <ul className="space-y-1 text-sm">
            <li>• {isAdmin ? 'Ilimitado' : plan.max_equipments} equipamentos</li>
            <li>• {isAdmin ? 'Ilimitado' : plan.max_technicians} técnicos</li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="font-semibold text-sm text-evolutec-text">Recursos:</p>
          <ul className="space-y-1">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check size={14} className="text-evolutec-green flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {!isAdmin && !isCurrentPlan && (
          <PricingButton
            planId={plan.id}
            planName={plan.name}
            isHighlighted={isHighlighted}
            isEnterprise={isEnterprise}
          />
        )}
        
        {isAdmin && (
          <div className="text-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <p className="text-sm font-medium text-yellow-800 flex items-center justify-center gap-2">
              <Crown size={14} />
              Acesso Total como Administrador
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanCard;
