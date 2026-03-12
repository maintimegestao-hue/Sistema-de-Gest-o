
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMonthlyStatusReset = () => {
  const resetMonthlyStatus = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      // Atualizar status para "pending" nos equipamentos do mês atual que estão "scheduled"
      const { error: updateError } = await supabase
        .from('annual_preventive_schedule')
        .update({ 
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('year', currentYear)
        .eq('month', currentMonth)
        .eq('status', 'scheduled');

      if (updateError) {
        console.error('Erro ao atualizar status para pending:', updateError);
        return;
      }

      // Marcar os equipamentos do mês anterior como "overdue" se não foram completados
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      const { error: overdueError } = await supabase
        .from('annual_preventive_schedule')
        .update({ 
          status: 'overdue',
          updated_at: new Date().toISOString()
        })
        .eq('year', previousYear)
        .eq('month', previousMonth)
        .neq('status', 'completed');

      if (overdueError) {
        console.error('Erro ao marcar como overdue:', overdueError);
        return;
      }

      console.log('Reset mensal executado com sucesso para', currentYear, currentMonth);
    } catch (error) {
      console.error('Erro no reset mensal:', error);
    }
  };

  useEffect(() => {
    // Executar reset ao carregar a página
    resetMonthlyStatus();
  }, []);

  return { resetMonthlyStatus };
};
