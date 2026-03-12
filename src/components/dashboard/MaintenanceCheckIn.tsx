
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wrench, CheckCircle } from 'lucide-react';
import { useMaintenanceForm } from '@/hooks/useMaintenanceForm';
import EquipmentSelector from '@/components/maintenance/EquipmentSelector';
import MaintenanceTypeSelector from '@/components/maintenance/MaintenanceTypeSelector';
import PeriodicitySelector from '@/components/maintenance/PeriodicitySelector';
import ChecklistSection from '@/components/maintenance/ChecklistSection';
import ObservationsField from '@/components/maintenance/ObservationsField';

const MaintenanceCheckIn = () => {
  const {
    selectedEquipment,
    setSelectedEquipment,
    maintenanceType,
    setMaintenanceType,
    periodicity,
    setPeriodicity,
    checklist,
    observations,
    setObservations,
    isPending,
    handleChecklistChange,
    getCurrentChecklist,
    resetPeriodicity,
    resetChecklist,
    handleSubmit
  } = useMaintenanceForm();

  const currentChecklist = getCurrentChecklist();

  return (
    <div className="maintex-card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Wrench size={20} className="text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Executar Manutenção
          </h3>
          <p className="text-sm text-muted-foreground">
            Registre a manutenção realizada em um equipamento
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <EquipmentSelector
          value={selectedEquipment}
          onChange={setSelectedEquipment}
        />

        <MaintenanceTypeSelector
          value={maintenanceType}
          onChange={setMaintenanceType}
          onReset={resetPeriodicity}
        />

        {maintenanceType === 'preventive' && (
          <PeriodicitySelector
            value={periodicity}
            onChange={setPeriodicity}
            onReset={resetChecklist}
          />
        )}

        <div className="text-sm text-muted-foreground">
          Checklist simplificado para dashboard. Use a página de execução para checklist completo.
        </div>

        <ObservationsField
          value={observations}
          onChange={setObservations}
        />

        <Button
          type="submit"
          disabled={isPending || !selectedEquipment || !maintenanceType || currentChecklist.length === 0}
          className="maintex-btn w-full"
        >
          {isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Salvando...
            </>
          ) : (
            <>
              <CheckCircle size={16} className="mr-2" />
              Registrar Manutenção
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default MaintenanceCheckIn;
