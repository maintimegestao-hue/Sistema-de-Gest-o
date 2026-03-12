import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateMaintenanceExecution } from '@/hooks/useCreateMaintenanceExecution';
import { useMaintenanceFormState } from '@/hooks/useMaintenanceFormState';
import { useMaintenanceChecklist } from '@/hooks/useMaintenanceChecklist';
import { useMaintenanceSignature } from '@/hooks/useMaintenanceSignature';
import { useMaintenanceFormValidation } from '@/hooks/useMaintenanceFormValidation';
import { useFieldAuth } from '@/hooks/useFieldAuth';
import BasicInfoSection from '../maintenance/BasicInfoSection';
import ChecklistSection from '../maintenance/ChecklistSection';
import EvidenceSection from '../maintenance/EvidenceSection';
import SignatureSection from '../maintenance/SignatureSection';
import DigitalSignatureSection from '../maintenance/DigitalSignatureSection';
import SubmitSection from '../maintenance/SubmitSection';
import FieldDateTimeFields from './FieldDateTimeFields';

interface FieldMaintenanceExecutorProps {
  equipment: any;
  onBack: () => void;
}

const FieldMaintenanceExecutor: React.FC<FieldMaintenanceExecutorProps> = ({ equipment, onBack }) => {
  const navigate = useNavigate();
  
  const { fieldTechnician } = useFieldAuth();
  const { mutate: createMaintenanceExecution, isPending } = useCreateMaintenanceExecution();

  // Estados do formulário
  const maintenanceState = useMaintenanceFormState();
  const checklistState = useMaintenanceChecklist(
    maintenanceState.maintenanceType, 
    maintenanceState.periodicity,
    maintenanceState.checklist
  );
  const signatureState = useMaintenanceSignature(maintenanceState.signatureRef, maintenanceState.setDigitalSignature);
  
  // Validação: digitais ou desenho no canvas; observações/data/hora opcionais
  const hasSignatureSaved = Boolean(maintenanceState.digitalSignature);
  const hasSignatureDrawn = Boolean(
    maintenanceState.signatureRef?.current && !maintenanceState.signatureRef.current.isEmpty()
  );
  const isChecklistValid = checklistState.totalItems === 0 || checklistState.completedItems === checklistState.totalItems;
  const requiresPeriodicity = maintenanceState.maintenanceType === 'preventive';
  const hasRequiredDates = Boolean(
    maintenanceState.startDate && maintenanceState.endDate && maintenanceState.startTime && maintenanceState.endTime
  );
  const hasObservations = maintenanceState.observations.trim().length > 0;
  const isFormValid = Boolean(
    maintenanceState.maintenanceType &&
    (!requiresPeriodicity || maintenanceState.periodicity) &&
    fieldTechnician?.name &&
    (hasSignatureSaved || hasSignatureDrawn) &&
    isChecklistValid &&
    hasRequiredDates &&
    hasObservations
  );

  const handleFinalizarManutencao = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Iniciando finalização da manutenção de campo');
    
    // Captura automática da assinatura se não foi salva
    let signatureData = maintenanceState.digitalSignature;
    if (!signatureData && maintenanceState.signatureRef?.current && !maintenanceState.signatureRef.current.isEmpty()) {
      try {
        signatureData = maintenanceState.signatureRef.current.toDataURL('image/png');
        maintenanceState.setDigitalSignature(signatureData);
      } catch (error) {
        console.error('Erro ao capturar assinatura automaticamente:', error);
      }
    }
    
    if (!isFormValid) {
      console.log('❌ Validação falhou');
      toast.error('Erro na validação - Verifique se todos os campos obrigatórios estão preenchidos.');
      return;
    }

    console.log('✅ Validação passou, finalizando manutenção...');
    
    // Fotos por item do checklist como anexos
    const checklistPhotoAttachments = checklistState.currentChecklist
      .map(item => {
        const data = (maintenanceState.checklist as any)[item];
        return data?.photo ? { 
          file: data.photo as File, 
          comment: `Foto - ${item}`, 
          type: 'photo' as const,
          checklistItem: item
        } : null;
      })
      .filter(Boolean) as Array<{ file: File; comment: string; type: 'photo'; checklistItem: string }>;
    
    const checklistItems = checklistState.currentChecklist.map((item) => {
      const data = (maintenanceState.checklist as any)[item] || {};
      return {
        item,
        status: data.status || '',
        comment: data.comment || '',
        attachments: checklistPhotoAttachments
          .filter(att => att.checklistItem === item)
          .map(att => ({ file: att.file, comment: att.comment, type: att.type }))
      };
    });
    
    // Combinar data e hora para criar timestamps (com valores padrão)
    const startDateISO = (maintenanceState.startDate ?? new Date()).toISOString().split('T')[0];
    const endDateISO = (maintenanceState.endDate ?? maintenanceState.startDate ?? new Date()).toISOString().split('T')[0];
    const startTimeStr = maintenanceState.startTime || new Date().toTimeString().slice(0,5);
    const endTimeStr = maintenanceState.endTime || startTimeStr;
    const startDateTime = new Date(`${startDateISO}T${startTimeStr}:00`);
    const endDateTime = new Date(`${endDateISO}T${endTimeStr}:00`);
    
    const executionData = {
      equipment_id: equipment.id,
      maintenance_type: maintenanceState.maintenanceType,
      technician_signature: fieldTechnician?.name || 'Técnico de Campo',
      observations: maintenanceState.observations.trim(),
      digital_signature: signatureData || maintenanceState.digitalSignature,
      checklist_items: checklistItems,
      periodicity: maintenanceState.periodicity,
      maintenance_order_id: undefined, // Para técnicos de campo, não há ordem selecionada
      attachments: [...maintenanceState.attachments, ...checklistPhotoAttachments],
      start_datetime: startDateTime.toISOString(),
      end_datetime: endDateTime.toISOString(),
    };

    createMaintenanceExecution(executionData, {
      onSuccess: () => {
        console.log('🎉 Manutenção de campo finalizada com sucesso!');
        toast.success('Manutenção registrada com sucesso!');
        // Navegar de volta para a página inicial do técnico (Selecione uma opção)
        navigate('/field-access');
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold">Executar Manutenção</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipamento Selecionado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Nome:</strong> {equipment.name}</p>
            <p><strong>Local:</strong> {equipment.installation_location || 'Não informado'}</p>
            <p><strong>Série:</strong> {equipment.serial_number || 'Não informado'}</p>
            <p><strong>Status:</strong> {equipment.status}</p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleFinalizarManutencao} className="space-y-6">
        <BasicInfoSection
          maintenanceType={maintenanceState.maintenanceType}
          setMaintenanceType={maintenanceState.setMaintenanceType}
          periodicity={maintenanceState.periodicity}
          setPeriodicity={maintenanceState.setPeriodicity}
          onMaintenanceTypeReset={maintenanceState.handleMaintenanceTypeReset}
          onPeriodicityReset={maintenanceState.handlePeriodicityReset}
          disabled={false}
          selectedEquipmentName={equipment.name}
        />

        <FieldDateTimeFields
          startDate={maintenanceState.startDate}
          setStartDate={maintenanceState.setStartDate}
          endDate={maintenanceState.endDate}
          setEndDate={maintenanceState.setEndDate}
          startTime={maintenanceState.startTime}
          setStartTime={maintenanceState.setStartTime}
          endTime={maintenanceState.endTime}
          setEndTime={maintenanceState.setEndTime}
        />

        {checklistState.currentChecklist.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <ChecklistSection
              items={checklistState.currentChecklist}
              checklist={maintenanceState.checklist}
              onItemChange={maintenanceState.handleChecklistChange}
            />
          </div>
        )}

        <EvidenceSection
          attachments={maintenanceState.attachments}
          setAttachments={maintenanceState.setAttachments}
        />

        <SignatureSection
          observations={maintenanceState.observations}
          setObservations={maintenanceState.setObservations}
          technicianSignature={fieldTechnician?.name || 'Técnico de Campo'}
          setTechnicianSignature={() => {}} // Read-only para campo
        />

        <DigitalSignatureSection
          signatureRef={maintenanceState.signatureRef}
          digitalSignature={maintenanceState.digitalSignature}
          onClearSignature={signatureState.handleClearSignature}
          onSaveSignature={signatureState.handleSaveSignature}
        />

        <button
          type="submit"
          disabled={isPending || !isFormValid}
          className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Finalizando...' : 'Finalizar Manutenção'}
        </button>
      </form>
    </div>
  );
};

export default FieldMaintenanceExecutor;