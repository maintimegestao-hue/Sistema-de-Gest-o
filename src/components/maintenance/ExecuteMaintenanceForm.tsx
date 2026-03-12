import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useExecuteMaintenanceForm } from '@/hooks/useExecuteMaintenanceForm';
import { useCreateMaintenanceExecution } from '@/hooks/useCreateMaintenanceExecution';
import BasicInfoSection from './BasicInfoSection';
import ChecklistSection from './ChecklistSection';
import EvidenceSection from './EvidenceSection';
import SignatureSection from './SignatureSection';
import DigitalSignatureSection from './DigitalSignatureSection';
import SubmitSection from './SubmitSection';
import OrderSelectionSection from './OrderSelectionSection';
import DateTimeFields from './DateTimeFields';

const ExecuteMaintenanceForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: createMaintenanceExecution, isPending } = useCreateMaintenanceExecution();
  
  // Estados para data/hora
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  
  const {
    selectedOrder,
    setSelectedOrder,
    selectedEquipment,
    setSelectedEquipment,
    setShowQRScanner,
    maintenanceType,
    setMaintenanceType,
    periodicity,
    setPeriodicity,
    checklist,
    observations,
    setObservations,
    technicianSignature,
    setTechnicianSignature,
    digitalSignature,
    attachments,
    setAttachments,
    signatureRef,
    availableOrders,
    currentChecklist,
    completedItems,
    totalItems,
    isFormValid,
    hasSelectedOrder,
    hasSelectedEquipment,
    hasMaintenanceType,
    hasTechnicianSignature,
    isChecklistValid,
    hasValidObservations,
    hasDigitalSignature,
    handleMaintenanceTypeReset,
    handlePeriodicityReset,
    handleClearSignature,
    handleSaveSignature,
    handleChecklistChange,
    selectedEquipmentData,
    handleQRCodeDetected,
  } = useExecuteMaintenanceForm();

  const handleFinalizarManutencao = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Iniciando finalização da manutenção');
    
    // Validação de data/hora
    const hasValidDateTime = startDateTime && endDateTime && new Date(startDateTime) < new Date(endDateTime);
    
    const validationDetails = {
      hasSelectedOrder,
      hasSelectedEquipment,
      hasMaintenanceType,
      hasTechnicianSignature,
      isChecklistValid,
      hasValidObservations,
      hasDigitalSignature,
      hasValidDateTime,
    };

    console.log('📋 Estado completo do formulário:', {
      selectedOrder,
      selectedEquipment,
      maintenanceType,
      technicianSignature,
      digitalSignature: Boolean(digitalSignature),
      observationsLength: observations.trim().length,
      checklistItems: completedItems,
      totalItems,
      startDateTime,
      endDateTime,
      isFormValid: isFormValid && hasValidDateTime,
      validationDetails
    });

    if (!isFormValid || !hasValidDateTime) {
      console.log('❌ Validação falhou');
      if (!hasValidDateTime) console.log('❌ Data/hora de início e fim obrigatórias');
      
      toast({
        title: 'Erro na validação',
        description: 'Verifique se todos os campos obrigatórios estão preenchidos, incluindo data e hora de início e fim.',
        variant: 'destructive',
      });
      return;
    }

    console.log('✅ Validação passou, preparando dados para envio...');
    
    const checkedItems = currentChecklist
      .filter(item => checklist[item]?.status)
      .map(item => {
        const data = checklist[item];
        const statusLabel = data.status === 'conforme' ? 'Conforme' : 'Não Conforme';
        const parts = [`${item}: ${statusLabel}`];
        if (data.comment) parts.push(`Comentário: ${data.comment}`);
        return parts.join(' - ');
      });
    
    // Incluir fotos por item do checklist como anexos adicionais
    const checklistPhotoAttachments = currentChecklist
      .map(item => {
        const itemData = checklist[item];
        if (itemData?.photo) {
          return { 
            file: itemData.photo as File, 
            comment: `Foto - ${item}`, 
            type: 'photo' as const,
            checklistItem: item // Adicionar referência ao item do checklist
          };
        }
        return null;
      })
      .filter(Boolean) as Array<{file: File, comment: string, type: 'photo', checklistItem: string}>;
    
    // Processar checklist incluindo fotos por item
    const processedChecklistItems = currentChecklist
      .filter(item => checklist[item]?.status)
      .map(item => {
        const data = checklist[item];
        const statusLabel = data.status === 'conforme' ? 'Conforme' : 'Não Conforme';
        const itemObj = {
          item,
          status: data.status,
          comment: data.comment || '',
          attachments: checklistPhotoAttachments
            .filter(att => att.checklistItem === item)
            .map(att => ({ file: att.file, comment: att.comment, type: att.type }))
        };
        return itemObj;
      });

    const executionData = {
      equipment_id: selectedEquipment,
      maintenance_type: maintenanceType,
      technician_signature: technicianSignature,
      observations: observations.trim(),
      digital_signature: digitalSignature,
      checklist_items: processedChecklistItems,
      periodicity,
      maintenance_order_id: selectedOrder || undefined,
      attachments: [...attachments, ...checklistPhotoAttachments],
      start_datetime: startDateTime,
      end_datetime: endDateTime,
    };

    console.log('📤 Dados que serão enviados:', executionData);

    createMaintenanceExecution(executionData, {
      onSuccess: (result) => {
        console.log('🎉 Manutenção finalizada com sucesso!', result);
        toast({
          title: 'Sucesso!',
          description: 'Manutenção finalizada e salva no histórico.',
        });
        
        // Verificar se é acesso de campo ou normal
        const isFieldAccess = localStorage.getItem('field_session');
        if (isFieldAccess) {
          // Redirecionar para seleção de equipamentos do campo técnico
          navigate('/field-access');
        } else {
          // Redirecionar para lista de manutenções normal
          navigate('/maintenance');
        }
      },
      onError: (error) => {
        console.error('💥 Erro ao finalizar manutenção:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao finalizar a manutenção. Tente novamente.',
          variant: 'destructive',
        });
      },
    });
  };

  const validationDetails = {
    hasSelectedOrder,
    hasSelectedEquipment,
    hasMaintenanceType,
    hasTechnicianSignature,
    isChecklistValid,
    hasValidObservations,
    hasDigitalSignature,
    hasValidDateTime: startDateTime && endDateTime && new Date(startDateTime) < new Date(endDateTime),
  };

  const isFormValidWithDateTime = isFormValid && validationDetails.hasValidDateTime;

  return (
    <form onSubmit={handleFinalizarManutencao} className="space-y-6">
      <OrderSelectionSection
        selectedOrder={selectedOrder}
        onOrderChange={setSelectedOrder}
        availableOrders={availableOrders}
      />

      <BasicInfoSection
        maintenanceType={maintenanceType}
        setMaintenanceType={setMaintenanceType}
        periodicity={periodicity}
        setPeriodicity={setPeriodicity}
        onMaintenanceTypeReset={handleMaintenanceTypeReset}
        onPeriodicityReset={handlePeriodicityReset}
        disabled={!!selectedOrder}
        selectedEquipmentName={selectedEquipmentData?.name}
        onQRCodeDetected={handleQRCodeDetected}
      />

      <DateTimeFields
        startDateTime={startDateTime}
        endDateTime={endDateTime}
        onStartDateTimeChange={setStartDateTime}
        onEndDateTimeChange={setEndDateTime}
      />

      {currentChecklist.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <ChecklistSection
            items={currentChecklist}
            checklist={checklist}
            onItemChange={handleChecklistChange}
          />
        </div>
      )}

      <EvidenceSection
        attachments={attachments}
        setAttachments={setAttachments}
      />

      <SignatureSection
        observations={observations}
        setObservations={setObservations}
        technicianSignature={technicianSignature}
        setTechnicianSignature={setTechnicianSignature}
      />

      <DigitalSignatureSection
        signatureRef={signatureRef}
        digitalSignature={digitalSignature}
        onClearSignature={handleClearSignature}
        onSaveSignature={handleSaveSignature}
      />

      <SubmitSection
        isPending={isPending}
        isFormValid={isFormValidWithDateTime}
        submitText="Finalizar Manutenção"
        validationDetails={validationDetails}
      />
    </form>
  );
};

export default ExecuteMaintenanceForm;