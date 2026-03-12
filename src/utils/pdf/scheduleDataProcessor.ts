
import { PreventiveScheduleItem } from '@/hooks/usePreventiveSchedule';
import { getPeriodicityLabel, getPeriodicityDisplayName } from './periodicityUtils';

export interface EquipmentGroup {
  equipment: PreventiveScheduleItem['equipment'];
  schedules: PreventiveScheduleItem[];
}

export const groupSchedulesByEquipment = (data: PreventiveScheduleItem[]) => {
  const equipmentGroups: Record<string, EquipmentGroup> = {};

  data.forEach(item => {
    // Filtrar apenas equipamentos ativos
    if (item.equipment?.status !== 'operational' && item.equipment?.status !== 'active') {
      return;
    }

    if (!equipmentGroups[item.equipment_id]) {
      equipmentGroups[item.equipment_id] = {
        equipment: item.equipment,
        schedules: []
      };
    }
    equipmentGroups[item.equipment_id].schedules.push(item);
  });

  return equipmentGroups;
};

const getMonthsForPeriodicity = (periodicity: string): number[] => {
  switch (periodicity) {
    case 'monthly':
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    case 'quarterly':
      return [1, 4, 7, 10]; // Jan, Abr, Jul, Out
    case 'semestral':
      return [1, 7]; // Jan, Jul
    case 'annual':
      return [1]; // Jan
    case 'bimonthly':
      return [1, 3, 5, 7, 9, 11]; // Bimestral
    default:
      return [1]; // Default anual
  }
};

export const prepareTableData = (equipmentGroups: Record<string, EquipmentGroup>) => {
  const tableRows: string[][] = [];
  const cellStyles: any = {};

  Object.entries(equipmentGroups).forEach(([equipmentId, group], rowIndex) => {
    const monthlySchedules = new Array(12).fill('');
    const periodicitySymbol = getPeriodicityLabel(group.equipment?.preventive_periodicity || '');
    
    // Obter meses válidos para a periodicidade
    const validMonths = getMonthsForPeriodicity(group.equipment?.preventive_periodicity || 'monthly');
    
    group.schedules.forEach(schedule => {
      const monthIndex = schedule.month - 1;
      
      // Só processar se o mês está na periodicidade configurada
      if (validMonths.includes(schedule.month)) {
        let cellColor = [255, 255, 255]; // branco por padrão
        
        switch (schedule.status) {
          case 'completed':
            cellColor = [144, 238, 144]; // verde claro
            break;
          case 'overdue':
            cellColor = [255, 182, 193]; // vermelho claro
            break;
          case 'pending':
            cellColor = [173, 216, 230]; // azul claro
            break;
          case 'scheduled':
            cellColor = [245, 245, 245]; // cinza claro
            break;
        }
        
        monthlySchedules[monthIndex] = periodicitySymbol;
        
        // Armazenar estilo da célula
        if (!cellStyles[rowIndex]) {
          cellStyles[rowIndex] = {};
        }
        cellStyles[rowIndex][monthIndex + 2] = { // +2 porque as duas primeiras colunas são equipamento e local
          fillColor: cellColor
        };
      }
    });

    // Para meses válidos que não têm agendamento, mostrar símbolo com cor neutra
    validMonths.forEach(month => {
      const monthIndex = month - 1;
      if (monthlySchedules[monthIndex] === '') {
        monthlySchedules[monthIndex] = periodicitySymbol;
        if (!cellStyles[rowIndex]) {
          cellStyles[rowIndex] = {};
        }
        if (!cellStyles[rowIndex][monthIndex + 2]) {
          cellStyles[rowIndex][monthIndex + 2] = {
            fillColor: [248, 249, 250] // cinza muito claro
          };
        }
      }
    });

    const periodicityLabel = getPeriodicityDisplayName(group.equipment?.preventive_periodicity || '');

    tableRows.push([
      `${group.equipment?.name || 'N/A'}\n(${periodicityLabel})`,
      `${group.equipment?.installation_location || 'N/A'}\n${group.equipment?.client || 'N/A'}`,
      ...monthlySchedules
    ]);
  });

  return { tableRows, cellStyles };
};
