
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { Subscription } from '@/hooks/useSubscription';

interface CurrentSubscriptionCardProps {
  subscription: Subscription;
  onManageSubscription: () => void;
}

const CurrentSubscriptionCard = ({ subscription, onManageSubscription }: CurrentSubscriptionCardProps) => {
  return (
    <Card className="border-evolutec-green">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-evolutec-green" />
              Assinatura Atual
            </CardTitle>
            <CardDescription>
              Seu plano {subscription.plans?.name}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-evolutec-green text-white">
            {subscription.status === 'active' ? 'Ativo' : subscription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-evolutec-text">Plano</p>
            <p className="font-semibold">{subscription.plans?.name}</p>
          </div>
          <div>
            <p className="text-sm text-evolutec-text">Preço</p>
            <p className="font-semibold">R$ {subscription.plans?.price}/mês</p>
          </div>
        </div>
        
        {subscription.current_period_end && (
          <div>
            <p className="text-sm text-evolutec-text">Próxima cobrança</p>
            <p className="font-semibold">
              {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={onManageSubscription} variant="outline">
            Gerenciar Assinatura
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentSubscriptionCard;
