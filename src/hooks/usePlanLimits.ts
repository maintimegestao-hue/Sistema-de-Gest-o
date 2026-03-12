import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "./useSubscription";
import { usePlans } from "./usePlans";
import { useUserProfile } from "./useUserProfile";

export interface PlanLimits {
  max_equipments: number;
  max_technicians: number;
  current_equipments: number;
  current_technicians: number;
  can_add_equipment: boolean;
  can_add_technician: boolean;
}

export const usePlanLimits = () => {
  const { data: subscription } = useSubscription();
  const { data: plans } = usePlans();
  const { data: userProfile } = useUserProfile();

  return useQuery({
    queryKey: ['plan-limits', subscription?.subscription_tier, userProfile?.role],
    queryFn: async (): Promise<PlanLimits> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Determinar limites baseado no tier da subscription
      let maxEquipments = 15; // Básico/Trial
      let maxTechnicians = 2;

      if (subscription?.subscribed) {
        // Usuário com assinatura paga
        switch (subscription.subscription_tier) {
          case 'premium':
            maxEquipments = 50;
            maxTechnicians = 5;
            break;
          case 'enterprise':
            maxEquipments = -1; // Ilimitado
            maxTechnicians = -1;
            break;
          default: // basic pago
            maxEquipments = 15;
            maxTechnicians = 2;
        }
      } else {
        // Usuário em trial ou sem assinatura - limites básicos
        maxEquipments = 15;
        maxTechnicians = 2;
      }

      // Contar equipamentos e técnicos atuais
      const [equipmentsResult, techniciansResult] = await Promise.all([
        supabase
          .from('equipments')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('technicians')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
      ]);

      const currentEquipments = equipmentsResult.count || 0;
      const currentTechnicians = techniciansResult.count || 0;

      const equipmentLimit = maxEquipments === -1 ? Infinity : maxEquipments;
      const technicianLimit = maxTechnicians === -1 ? Infinity : maxTechnicians;

      return {
        max_equipments: maxEquipments,
        max_technicians: maxTechnicians,
        current_equipments: currentEquipments,
        current_technicians: currentTechnicians,
        can_add_equipment: currentEquipments < equipmentLimit,
        can_add_technician: currentTechnicians < technicianLimit,
      };
    },
    enabled: !!userProfile,
  });
};