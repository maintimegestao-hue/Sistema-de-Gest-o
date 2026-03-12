
import { checklists } from '@/components/maintenance/MaintenanceChecklists';

export const useMaintenanceChecklist = (
  maintenanceType: string,
  periodicity: string,
  checklist: {[key: string]: any}
) => {
  const getCurrentChecklist = () => {
    if (maintenanceType === 'preventive' && periodicity) {
      return checklists[periodicity as keyof typeof checklists] || [];
    }
    if (maintenanceType === 'corrective') {
      return checklists.corrective;
    }
    if (maintenanceType === 'predictive') {
      return checklists.predictive;
    }
    return [];
  };

  const currentChecklist = getCurrentChecklist();

  const completedItems = currentChecklist.filter(item => {
    const data = (checklist as any)[item];
    return data && (data.status === 'conforme' || data.status === 'nao_conforme');
  }).length;
  const totalItems = currentChecklist.length;

  return {
    currentChecklist,
    completedItems,
    totalItems,
    getCurrentChecklist,
  };
};
