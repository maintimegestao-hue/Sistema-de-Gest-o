import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useScheduleStatusUpdater = () => {
  useEffect(() => {
    const updateStatus = async () => {
      try {
        // Chamar função para atualizar status dos equipamentos
        await supabase.rpc('update_equipment_maintenance_status');
        
        // Verificar se é início do ano para reset
        const now = new Date();
        if (now.getMonth() === 0 && now.getDate() === 1) {
          await supabase.rpc('reset_annual_preventive_schedule');
        }
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
      }
    };

    // Executar ao carregar
    updateStatus();

    // Configurar intervalo para verificar a cada hora
    const interval = setInterval(updateStatus, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};