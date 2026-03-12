
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  max_equipments: number;
  max_technicians: number;
  features: string[];
  stripe_price_id: string | null;
  is_active: boolean;
}

// Dados dos planos atualizados
const defaultPlans: Plan[] = [
  {
    id: "basic",
    name: "Básico",
    price: 29.00,
    period: "monthly",
    max_equipments: 15,
    max_technicians: 2,
    features: [
      "Até 15 equipamentos",
      "2 técnicos",
      "QR Code básico",
      "Relatórios simples",
      "Suporte por email"
    ],
    stripe_price_id: null,
    is_active: true
  },
  {
    id: "premium",
    name: "Premium",
    price: 89.90,
    period: "monthly",
    max_equipments: 50,
    max_technicians: 5,
    features: [
      "Até 50 equipamentos",
      "5 técnicos",
      "QR Code avançado",
      "Relatórios detalhados",
      "Cronograma preventivo",
      "Suporte prioritário"
    ],
    stripe_price_id: null,
    is_active: true
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 129.90,
    period: "monthly",
    max_equipments: -1, // Ilimitado
    max_technicians: -1, // Ilimitado
    features: [
      "Equipamentos ilimitados",
      "Técnicos ilimitados",
      "Integração personalizada",
      "Relatórios customizados",
      "Suporte dedicado",
      "Treinamento incluso"
    ],
    stripe_price_id: null,
    is_active: true
  }
];

export const usePlans = () => {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('is_active', true)
          .order('price');
        
        if (error) {
          console.warn('Error fetching plans from database, using default plans:', error);
          return defaultPlans;
        }
        
        // Se não há dados no banco, retorna os planos padrão
        if (!data || data.length === 0) {
          return defaultPlans;
        }
        
        return data as Plan[];
      } catch (error) {
        console.warn('Error connecting to database, using default plans:', error);
        return defaultPlans;
      }
    },
  });
};
