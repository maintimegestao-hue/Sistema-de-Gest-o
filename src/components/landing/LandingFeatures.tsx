
import { QrCode, Calendar, Settings, User, FileText, Check } from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "QR Code Inteligente",
    description: "Cada equipamento possui um QR Code único que centraliza histórico, documentos e próximas manutenções.",
    benefits: ["Acesso rápido via smartphone", "Histórico completo", "Status em tempo real"]
  },
  {
    icon: Calendar,
    title: "Agendamento Automático",
    description: "Sistema inteligente que agenda manutenções preventivas baseado no histórico e especificações do fabricante.",
    benefits: ["Alertas por WhatsApp/Email", "Cronograma personalizado", "Redução de falhas"]
  },
  {
    icon: Settings,
    title: "Gestão de Equipamentos",
    description: "Cadastro completo com fotos, documentos, localização e todas as informações técnicas necessárias.",
    benefits: ["Fotos e documentos", "Localização GPS", "Histórico detalhado"]
  },
  {
    icon: User,
    title: "App Mobile para Técnicos",
    description: "Interface otimizada para técnicos em campo com check-in/out, checklists e assinatura digital.",
    benefits: ["Funciona offline", "Assinatura digital", "Fotos antes/depois"]
  },
  {
    icon: FileText,
    title: "Relatórios Avançados",
    description: "Analytics completos com MTBF, custos por equipamento, frequência de falhas e muito mais.",
    benefits: ["Exportação PDF/Excel", "Gráficos interativos", "Métricas de performance"]
  },
  {
    icon: Check,
    title: "Multi-tenant SaaS",
    description: "Arquitetura robusta que suporta múltiplas empresas com isolamento total de dados e permissões.",
    benefits: ["Diferentes perfis", "Segurança avançada", "Escalabilidade total"]
  }
];

const LandingFeatures = () => {
  return (
    <section id="recursos" className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Recursos que Revolucionam
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Uma suite completa de ferramentas pensadas para maximizar a eficiência 
            da sua operação de manutenção de ar-condicionado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="maintex-card group hover:scale-105 transition-transform duration-300"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <feature.icon 
                    size={24} 
                    className="text-primary group-hover:text-primary-foreground transition-colors duration-300" 
                  />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {feature.description}
              </p>

              <ul className="space-y-2">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={10} className="text-primary-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Pronto para transformar sua gestão?
            </h3>
            <p className="text-muted-foreground mb-6">
              Comece seu teste gratuito hoje e veja como o Maintime 
              pode revolucionar sua operação.
            </p>
            <button className="maintex-btn text-lg px-8 py-4">
              Iniciar Teste Gratuito de 7 Dias
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
