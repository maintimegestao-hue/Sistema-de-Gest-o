import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAccess } from "./useAdminAccess";

export const useAdminDashboard = () => {
  const { isAdmin } = useAdminAccess();

  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      if (!isAdmin) {
        throw new Error('Access denied: Admin only');
      }

      // Buscar estatísticas gerais da plataforma para administradores
      const [
        totalUsers,
        totalEquipments,
        totalMaintenanceOrders,
        totalReports
      ] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact' }),
        supabase.from('equipments').select('id', { count: 'exact' }),
        supabase.from('maintenance_orders').select('id', { count: 'exact' }),
        supabase.from('reports').select('id', { count: 'exact' })
      ]);

      return {
        totalUsers: totalUsers.count || 0,
        totalEquipments: totalEquipments.count || 0,
        totalMaintenanceOrders: totalMaintenanceOrders.count || 0,
        totalReports: totalReports.count || 0,
        platformStats: {
          message: "🚀 Como administrador, você pode ver estatísticas globais da plataforma",
          features: [
            "Acesso ilimitado a equipamentos e técnicos",
            "Visualização de dados de todos os usuários",
            "Controle total da plataforma",
            "Sem restrições de plano ou assinatura"
          ]
        }
      };
    },
    enabled: isAdmin, // Só executar se for admin
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};