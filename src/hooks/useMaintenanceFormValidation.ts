
export const useMaintenanceFormValidation = (
  selectedOrder: string,
  selectedEquipment: string,
  maintenanceType: string,
  technicianSignature: string,
  observations: string,
  digitalSignature: string,
  totalItems: number,
  completedItems: number
) => {
  // Validação dos campos básicos obrigatórios (removendo selectedOrder da obrigatoriedade)
  const hasSelectedEquipment = Boolean(selectedEquipment && selectedEquipment.trim());
  const hasMaintenanceType = Boolean(maintenanceType && maintenanceType.trim());
  const hasTechnicianSignature = Boolean(technicianSignature && technicianSignature.trim());
  
  // Campo opcional
  const hasSelectedOrder = Boolean(selectedOrder && selectedOrder.trim());
  
  const hasBasicFields = hasSelectedEquipment && hasMaintenanceType && hasTechnicianSignature;
  
  // Validação do checklist: se há itens, pelo menos um deve estar marcado
  const isChecklistValid = totalItems === 0 || completedItems > 0;
  
  // Observações opcionais: se preenchidas, exigir mínimo de 3 caracteres
  const observationsText = observations?.trim() || '';
  const hasValidObservations = observationsText.length === 0 || observationsText.length >= 3;
  
  // Validação da assinatura digital: mais flexível
  const hasDigitalSignature = Boolean(
    digitalSignature && 
    digitalSignature.trim() !== '' && 
    digitalSignature !== 'data:,' &&
    (digitalSignature.includes('data:image') || digitalSignature.length > 10)
  );
  
  // O formulário é válido quando os campos OBRIGATÓRIOS estão preenchidos (sem selectedOrder)
  const isFormValid = hasBasicFields && isChecklistValid && hasDigitalSignature && hasValidObservations;

  console.log('🔍 Validação detalhada do formulário:', {
    selectedOrder: hasSelectedOrder,
    selectedEquipment: hasSelectedEquipment, 
    maintenanceType: hasMaintenanceType,
    technicianSignature: hasTechnicianSignature,
    hasBasicFields,
    totalItems,
    completedItems,
    isChecklistValid,
    observationsLength: observationsText.length,
    hasValidObservations,
    digitalSignatureLength: digitalSignature?.length || 0,
    digitalSignatureValid: hasDigitalSignature,
    isFormValid,
    allFieldsStatus: {
      order: hasSelectedOrder ? '✅' : '⚪ (opcional)',
      equipment: hasSelectedEquipment ? '✅' : '❌',
      type: hasMaintenanceType ? '✅' : '❌',
      technician: hasTechnicianSignature ? '✅' : '❌',
      checklist: isChecklistValid ? '✅' : '❌',
      observations: hasValidObservations ? '✅' : '❌',
      signature: hasDigitalSignature ? '✅' : '❌'
    }
  });

  return {
    isFormValid,
    hasBasicFields,
    isChecklistValid,
    hasValidObservations,
    hasDigitalSignature,
    // Campos individuais para debug
    hasSelectedOrder,
    hasSelectedEquipment,
    hasMaintenanceType,
    hasTechnicianSignature,
  };
};
