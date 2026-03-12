
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { toast } from 'sonner';

interface PricingButtonProps {
  planId: string;
  planName: string;
  isHighlighted?: boolean;
  isEnterprise?: boolean;
}

export const PricingButton = ({ planId, planName, isHighlighted, isEnterprise }: PricingButtonProps) => {
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const stripeCheckout = useStripeCheckout();

  const handleClick = () => {
    if (isEnterprise) {
      // Redirecionar para WhatsApp para contato de vendas
      const phoneNumber = "5511999999999"; // Substitua pelo número real
      const message = "Olá! Gostaria de saber mais sobre o plano Enterprise.";
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      return;
    }

    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    // Para usuários logados, simular início do teste ou redirecionamento
    toast.success('Iniciando teste gratuito de 7 dias!');
    // Aqui você pode implementar a lógica real de criação de teste
    // stripeCheckout.mutate({ planId });
  };

  const handleAuthSuccess = () => {
    if (!isEnterprise) {
      toast.success('Conta criada! Iniciando teste gratuito de 7 dias!');
      // Aqui você pode implementar a lógica real de criação de teste
      // stripeCheckout.mutate({ planId });
    }
  };

  const buttonText = () => {
    if (isEnterprise) return 'Falar com Vendas';
    if (user) return 'Iniciar Teste';
    return 'Teste Grátis por 7 dias';
  };

  return (
    <>
      <Button 
        onClick={handleClick}
        disabled={stripeCheckout.isPending}
        className={
          isHighlighted 
            ? "evolutec-btn w-full" 
            : "w-full border-evolutec-green text-evolutec-green hover:bg-evolutec-green hover:text-white"
        }
        variant={isHighlighted ? "default" : "outline"}
      >
        {stripeCheckout.isPending ? 'Processando...' : buttonText()}
      </Button>
      
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};
