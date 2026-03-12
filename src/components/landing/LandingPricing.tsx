
import { Button } from "@/components/ui/button";
import { Check, Star, Zap } from "lucide-react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useState } from "react";
import { useStripeCheckout } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";

const LandingPricing = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const stripeCheckout = useStripeCheckout();
  const { user } = useAuth();

  const plans = [
    {
      id: "basic",
      name: "Básico",
      subtitle: "7 dias grátis para testar",
      price: "R$ 29",
      priceAmount: 2900, // em centavos
      period: "/mês",
      trialBadge: "TESTE GRATUITO 7 DIAS",
      trialColor: "bg-green-100 text-green-700",
      description: "Perfeito para pequenas empresas que estão começando",
      features: [
        "Até 15 equipamentos",
        "2 técnicos cadastrados",
        "Manutenções básicas",
        "Relatórios simples",
        "QR Code básico",
        "Suporte por email"
      ],
      buttonText: "Começar Teste Grátis",
      buttonStyle: "bg-green-600 hover:bg-green-700 text-white",
      popular: false,
      isFreeTrial: true
    },
    {
      id: "premium",
      name: "Premium",
      subtitle: "Mais popular",
      price: "R$ 89,90",
      priceAmount: 8990, // em centavos
      period: "/mês",
      trialBadge: "PLANO RECOMENDADO",
      trialColor: "bg-blue-100 text-blue-700",
      description: "Para empresas em crescimento que precisam de mais recursos",
      features: [
        "Até 50 equipamentos",
        "5 técnicos cadastrados",
        "Manutenções avançadas",
        "Relatórios detalhados",
        "Cronograma preventivo",
        "QR Code para equipamentos",
        "Suporte prioritário"
      ],
      buttonText: "Adquirir Plano",
      buttonStyle: "bg-blue-600 hover:bg-blue-700 text-white",
      popular: true,
      isFreeTrial: false
    },
    {
      id: "enterprise",
      name: "Enterprise",
      subtitle: "Solução completa",
      price: "R$ 129,90",
      priceAmount: 12990, // em centavos
      period: "/mês",
      trialBadge: "RECURSOS PREMIUM",
      trialColor: "bg-purple-100 text-purple-700",
      description: "Para grandes empresas com necessidades complexas",
      features: [
        "Equipamentos ilimitados",
        "Técnicos ilimitados",
        "Todos os recursos",
        "Relatórios personalizados",
        "API de integração",
        "Treinamento personalizado",
        "Suporte 24/7",
        "Gerente dedicado"
      ],
      buttonText: "Adquirir Plano",
      buttonStyle: "bg-purple-600 hover:bg-purple-700 text-white",
      popular: false,
      isFreeTrial: false
    }
  ];


  const handlePlanClick = (plan: any) => {
    if (plan.isFreeTrial) {
      // Plano básico - precisa estar logado para teste grátis
      if (!user) {
        setShowAuthDialog(true);
        return;
      }
      // Redirecionar para dashboard - o teste será criado automaticamente
      window.location.href = '/dashboard';
    } else {
      // Planos pagos - ir direto para checkout do Stripe
      stripeCheckout.mutate({
        planId: plan.id,
        priceAmount: plan.priceAmount
      });
    }
  };

  const handlePurchasePlan = (plan: any) => {
    // Comprar diretamente o plano (sem teste grátis)
    stripeCheckout.mutate({
      planId: plan.id,
      priceAmount: plan.priceAmount
    });
  };

  const displayPlans = plans;

  return (
    <section id="precos" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Planos Mensais Simples e Transparentes
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Escolha o plano mensal que melhor se adapta ao seu negócio. 
            <span className="text-primary font-semibold"> Inicie pelo plano básico com 7 dias grátis!</span>
          </p>
          
          {/* Badge de destaque mensal */}
          <div className="inline-flex items-center mt-6 bg-white px-6 py-2 rounded-full font-semibold text-sm shadow-lg border-2 border-evolutec-green">
            <Zap className="w-4 h-4 mr-2 text-evolutec-green" />
            <span className="text-evolutec-green">💳 Cobrança Mensal • 🚫 Sem Fidelidade • ✅ Cancele Quando Quiser</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {displayPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-xl shadow-lg p-8 ${
                plan.popular ? 'ring-2 ring-blue-500 transform scale-105' : ''
              }`}
            >
              {/* Badge do plano */}
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${plan.trialColor}`}>
                {plan.trialBadge}
              </div>

              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Mais Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-evolutec-black mb-2">{plan.name}</h3>
                <p className="text-evolutec-text text-sm mb-4">{plan.subtitle}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-evolutec-black">{plan.price}</span>
                  <span className="text-evolutec-text font-medium">{plan.period}</span>
                </div>
                <div className="text-sm text-evolutec-text mb-4">{plan.description}</div>
                
                {/* Badge específico */}
                {!plan.isFreeTrial && (
                  <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold inline-block">
                    💰 Plano Mensal - Sem Compromisso
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-evolutec-green mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-evolutec-text">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handlePlanClick(plan)}
                className={`w-full ${plan.buttonStyle} shadow-lg hover:shadow-xl transition-all duration-200 mb-3`}
                disabled={stripeCheckout.isPending}
              >
                {stripeCheckout.isPending ? 'Processando...' : plan.buttonText}
              </Button>
              
              {plan.isFreeTrial && (
                <>
                  <Button
                    onClick={() => handlePurchasePlan(plan)}
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50 shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={stripeCheckout.isPending}
                  >
                    {stripeCheckout.isPending ? 'Processando...' : 'Adquirir Plano'}
                  </Button>
                  <p className="text-center text-xs text-evolutec-text mt-3">
                    🎯 Teste por 7 dias • 💳 Cobrança apenas após o período
                  </p>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-lg p-6 max-w-4xl mx-auto shadow-md">
            <h3 className="text-lg font-semibold text-evolutec-black mb-3">
              ✅ Garantia de Satisfação - Política de Planos Mensais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-evolutec-text">
              <div className="flex items-center justify-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span>7 dias gratuitos para testar</span>
              </div>
              <div className="flex items-center justify-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span>Cobrança mensal automática</span>
              </div>
              <div className="flex items-center justify-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span>Cancele a qualquer momento</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
      />
    </section>
  );
};

export default LandingPricing;
