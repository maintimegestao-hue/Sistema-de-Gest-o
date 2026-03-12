
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';

const TrialBanner = () => {
  const { data: subscription, isLoading } = useSubscription();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!subscription?.trial_end) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const trialEnd = new Date(subscription.trial_end!).getTime();
      const difference = trialEnd - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${minutes}m ${seconds}s`);
        }
      } else {
        setTimeLeft('Expirado');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [subscription]);

  // Não mostrar se carregando ou se usuário tem assinatura ativa
  if (isLoading || !subscription || subscription.subscribed) {
    return null;
  }

  // Só mostra se o usuário estiver em trial (não subscribed)
  if (!subscription.trial_end) {
    return null;
  }

  const isExpired = subscription.trial_expired || subscription.days_remaining === 0;
  const daysLeft = subscription.days_remaining || 0;

  return (
    <Card className={`mb-6 ${isExpired ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isExpired ? (
              <AlertTriangle className="h-6 w-6 text-red-600" />
            ) : (
              <Clock className="h-6 w-6 text-orange-600" />
            )}
            <div>
              <h3 className={`font-semibold ${isExpired ? 'text-red-800' : 'text-orange-800'}`}>
                {isExpired ? '⚠️ Período de Avaliação Expirado' : '⏰ Período de Avaliação Gratuita Ativo'}
              </h3>
              <p className={`text-sm ${isExpired ? 'text-red-700' : 'text-orange-700'}`}>
                {isExpired ? (
                  'Seu período gratuito expirou. Para continuar usando o sistema, contrate um plano mensal.'
                ) : (
                  <>
                    Você está em período de avaliação gratuita. Restam: <span className="font-mono font-bold text-lg">{timeLeft}</span>
                    {daysLeft > 0 && (
                      <span className="ml-2 text-orange-600 font-semibold">
                        ({daysLeft} {daysLeft === 1 ? 'dia' : 'dias'})
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isExpired && daysLeft <= 2 && (
              <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-semibold animate-pulse">
                ⚡ Últimos dias!
              </div>
            )}
            <Button 
              onClick={() => window.location.href = '/#precos'}
              className={`${
                isExpired 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white shadow-lg`}
              size="sm"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isExpired ? '🚀 Ver Planos' : '⬆️ Fazer Upgrade'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrialBanner;
