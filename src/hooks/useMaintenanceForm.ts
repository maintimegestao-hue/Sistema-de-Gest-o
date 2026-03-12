
import { useState } from 'react';
import { useCreateSecureMaintenanceOrder } from '@/hooks/useSecureMaintenanceOrders';
import { checklists } from '@/components/maintenance/MaintenanceChecklists';
import { sanitizeString } from '@/lib/validation';

export const useMaintenanceForm = () => {
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('');
  const [periodicity, setPeriodicity] = useState('');
  const [checklist, setChecklist] = useState<{[key: string]: boolean}>({});
  const [observations, setObservations] = useState('');
  
  const { mutate: createMaintenanceOrder, isPending } = useCreateSecureMaintenanceOrder();

  const handleChecklistChange = (item: string, checked: boolean) => {
    setChecklist(prev => ({
      ...prev,
      [item]: checked
    }));
  };

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

  const resetForm = () => {
    setSelectedEquipment('');
    setMaintenanceType('');
    setPeriodicity('');
    setChecklist({});
    setObservations('');
  };

  const resetPeriodicity = () => {
    setPeriodicity('');
    setChecklist({});
  };

  const resetChecklist = () => {
    setChecklist({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEquipment || !maintenanceType) {
      alert('Por favor, selecione o equipamento e o tipo de manutenção.');
      return;
    }

    const currentChecklist = getCurrentChecklist();
    const checkedItems = currentChecklist.filter(item => checklist[item]);
    
    // Sanitize observations before including in description
    const sanitizedObservations = sanitizeString(observations);
    
    const description = `${maintenanceType === 'preventive' ? 'Manutenção Preventiva' : 
                        maintenanceType === 'corrective' ? 'Manutenção Corretiva' : 
                        'Manutenção Preditiva'}${periodicity ? ` - ${periodicity}` : ''}\n\nItens realizados:\n${checkedItems.map(item => `• ${item}`).join('\n')}\n\nObservações: ${sanitizedObservations}`;

    createMaintenanceOrder({
      equipment_id: selectedEquipment,
      description,
      maintenance_type: maintenanceType as 'preventive' | 'corrective' | 'predictive',
      priority: 'medium',
      status: 'completed',
      scheduled_date: new Date().toISOString().split('T')[0]
    }, {
      onSuccess: resetForm
    });
  };

  const handleObservationsChange = (value: string) => {
    setObservations(value);
  };

  return {
    selectedEquipment,
    setSelectedEquipment,
    maintenanceType,
    setMaintenanceType,
    periodicity,
    setPeriodicity,
    checklist,
    observations,
    setObservations: handleObservationsChange,
    isPending,
    handleChecklistChange,
    getCurrentChecklist,
    resetPeriodicity,
    resetChecklist,
    handleSubmit
  };
};
