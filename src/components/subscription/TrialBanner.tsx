import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CreditCard } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const TrialBanner: React.FC = () => {
  const { data: subscription } = useSubscription();
  const { isAdmin } = useAdminAccess();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!subscription?.trial_end) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const trialEnd = new Date(subscription.trial_end!).getTime();
      const distance = trialEnd - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      } else {
        setTimeLeft('Expirado');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [subscription?.trial_end]);

  // 🚀 Mostrar banner apenas para usuários em trial (não assinantes)
  if (!subscription || subscription.subscribed) {
    return null;
  }

  // Mostrar para usuários com trial (básico durante trial) ou trial expirado
  const isInTrial = subscription.subscription_tier === 'basic' && subscription.trial_end;
  if (!isInTrial) {
    return null;
  }

  const isExpired = subscription.trial_expired || subscription.days_remaining === 0;

  const handleUpgrade = () => {
    // Redirecionar para a página inicial com os planos
    window.location.href = '/#precos';
  };

  return (
    <Alert className={`mb-6 border-2 ${isExpired ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-start space-x-3">
          <AlertTriangle className={`h-5 w-5 mt-0.5 ${isExpired ? 'text-red-600' : 'text-orange-600'}`} />
          <div className="flex-1">
            <AlertDescription className={`font-medium ${isExpired ? 'text-red-800' : 'text-orange-800'}`}>
              {isExpired ? (
                <>
                  <strong>🚨 Seu período de teste gratuito de 7 dias expirou!</strong>
                  <br />
                  Para continuar usando o sistema com todas as funcionalidades, faça upgrade para um plano pago.
                  <br />
                  <span className="text-sm">🎯 Você está limitado às funcionalidades básicas.</span>
                </>
              ) : (
                <>
                  <strong>⏰ Período de teste gratuito ativo - Plano Básico</strong>
                  <br />
                  Sua avaliação gratuita termina em{' '}
                  <span className="font-bold text-red-600">{subscription.days_remaining} dias</span>.
                  <br />
                  <span className="text-sm">🎯 Acesso completo ao Plano Básico + teste de todas as funcionalidades!</span>
                </>
              )}
            </AlertDescription>
            {!isExpired && timeLeft && (
              <div className="flex items-center mt-2 text-sm text-orange-700">
                <Clock className="h-4 w-4 mr-1" />
                <span className="font-mono font-bold">{timeLeft}</span>
              </div>
            )}
          </div>
        </div>
        <Button 
          onClick={handleUpgrade}
          className={`${isExpired ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold px-6`}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          {isExpired ? '🚀 Assinar Agora' : '⬆️ Ver Planos'}
        </Button>
      </div>
    </Alert>
  );
};

export default TrialBanner;