
import { Button } from "@/components/ui/button";
import { Check, Settings, QrCode, Calendar } from "lucide-react";
import { useState } from "react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useNavigate } from "react-router-dom";

const LandingHero = () => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const navigate = useNavigate();

  const handleStartFreeTrialClick = () => {
    setShowAuthDialog(true);
  };

  const handleAuthSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-secondary opacity-50"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                🚀 Revolucione sua gestão de manutenção
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Gestão Inteligente de 
                <span className="text-primary block">
                  Ar-Condicionado
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Sistema SaaS completo para controle de manutenção preventiva e corretiva. 
                QR Code, agendamentos automáticos e relatórios inteligentes.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              {[
                "QR Code único para cada equipamento",
                "Agendamento automático de manutenções",
                "App mobile para técnicos em campo",
                "Relatórios detalhados e métricas"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check size={12} className="text-primary-foreground" />
                  </div>
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="maintex-btn text-lg px-8 py-4"
                onClick={handleStartFreeTrialClick}
              >
                Começar Teste Grátis
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-4"
                onClick={handleStartFreeTrialClick}
              >
                Ver Demonstração
              </Button>
            </div>

            {/* Social Proof */}
            <div className="pt-8 border-t border-gray-200">
              <p className="text-sm text-muted-foreground mb-4">
                Confiança de empresas líderes do mercado
              </p>
              <div className="flex items-center space-x-8 opacity-60">
                <div className="text-sm font-semibold">EMPRESA A</div>
                <div className="text-sm font-semibold">EMPRESA B</div>
                <div className="text-sm font-semibold">EMPRESA C</div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative animate-scale-in">
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 transform rotate-2">
              {/* Mock Dashboard */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Dashboard Maintime</h3>
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-evolutec-gray rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Settings size={16} className="text-evolutec-green" />
                      <span className="text-sm text-evolutec-text">Equipamentos</span>
                    </div>
                    <div className="text-2xl font-bold text-evolutec-black mt-1">245</div>
                  </div>
                  <div className="bg-evolutec-gray rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-evolutec-green" />
                      <span className="text-sm text-evolutec-text">Manutenções</span>
                    </div>
                    <div className="text-2xl font-bold text-evolutec-black mt-1">89</div>
                  </div>
                </div>

                {/* QR Code Example */}
                <div className="bg-evolutec-gray rounded-lg p-4 flex items-center space-x-3">
                  <QrCode size={40} className="text-evolutec-green" />
                  <div>
                    <div className="text-sm font-medium text-evolutec-black">AC-001-2024</div>
                    <div className="text-xs text-evolutec-text">Última manutenção: 15/01/2024</div>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="text-sm text-evolutec-text">Eficiência Operacional</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-evolutec-green h-2 rounded-full w-4/5"></div>
                  </div>
                  <div className="text-xs text-evolutec-text text-right">92%</div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3 transform -rotate-12">
              <QrCode size={24} className="text-evolutec-green" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-evolutec-green rounded-lg shadow-lg p-3 transform rotate-12">
              <Check size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        onSuccess={handleAuthSuccess}
      />
    </section>
  );
};

export default LandingHero;
