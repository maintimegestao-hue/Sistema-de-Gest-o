
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const SubscriptionInfo = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Importantes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Check size={16} className="text-evolutec-green" />
          <span className="text-sm">Teste gratuito de 7 dias em todos os planos</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={16} className="text-evolutec-green" />
          <span className="text-sm">Cancelamento a qualquer momento</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={16} className="text-evolutec-green" />
          <span className="text-sm">Suporte técnico incluído</span>
        </div>
        <div className="flex items-center gap-2">
          <Check size={16} className="text-evolutec-green" />
          <span className="text-sm">Pagamentos seguros processados pelo Stripe</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionInfo;
