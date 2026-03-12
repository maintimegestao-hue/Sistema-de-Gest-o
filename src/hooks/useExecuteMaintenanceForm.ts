
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSecureEquipments } from '@/hooks/useSecureEquipments';
import { useSecureMaintenanceOrders } from '@/hooks/useSecureMaintenanceOrders';
import { useToast } from '@/hooks/use-toast';
import { useMaintenanceFormState } from './useMaintenanceFormState';
import { useMaintenanceQRHandler } from './useMaintenanceQRHandler';
import { useMaintenanceSignature } from './useMaintenanceSignature';
import { useMaintenanceChecklist } from './useMaintenanceChecklist';
import { useMaintenanceFormValidation } from './useMaintenanceFormValidation';

export const useExecuteMaintenanceForm = () => {
  const location = useLocation();
  const { toast } = useToast();
  
  const { data: equipments } = useSecureEquipments();
  const { data: maintenanceOrders } = useSecureMaintenanceOrders();

  // Use smaller hooks
  const formState = useMaintenanceFormState();
  const qrHandler = useMaintenanceQRHandler(formState.setSelectedEquipment, formState.setShowQRScanner);
  const signatureHandler = useMaintenanceSignature(formState.signatureRef, formState.setDigitalSignature);
  const checklistData = useMaintenanceChecklist(formState.maintenanceType, formState.periodicity, formState.checklist);
  
  // Update checklist when equipment or maintenance type changes
  useEffect(() => {
    if (formState.selectedEquipment && formState.maintenanceType) {
      console.log('🔄 Atualizando checklist para:', { 
        maintenanceType: formState.maintenanceType, 
        periodicity: formState.periodicity 
      });
      // Force re-evaluation of checklist
      checklistData.getCurrentChecklist();
    }
  }, [formState.selectedEquipment, formState.maintenanceType, formState.periodicity]);
  const validation = useMaintenanceFormValidation(
    formState.selectedOrder,
    formState.selectedEquipment,
    formState.maintenanceType,
    formState.technicianSignature,
    formState.observations,
    formState.digitalSignature,
    checklistData.totalItems,
    checklistData.completedItems
  );

  // Filter available orders
  const availableOrders = maintenanceOrders?.filter(order => 
    order.status === 'pending' || order.status === 'in_progress'
  ) || [];

  // Pre-fill data from location state
  useEffect(() => {
    if (location.state?.selectedOrderId) {
      formState.setSelectedOrder(location.state.selectedOrderId);
    }
    if (location.state?.selectedEquipmentId) {
      formState.setSelectedEquipment(location.state.selectedEquipmentId);
    }
  }, [location.state]);

  // Pre-fill data when an order is selected
  useEffect(() => {
    if (formState.selectedOrder) {
      const order = availableOrders.find(o => o.id === formState.selectedOrder);
      if (order) {
        formState.setSelectedEquipment(order.equipment_id || '');
        formState.setMaintenanceType(order.maintenance_type || '');
        toast({
          title: 'O.S. selecionada!',
          description: `O.S. #${order.id.slice(-6)} foi selecionada.`,
        });
      }
    }
  }, [formState.selectedOrder, availableOrders, toast]);

  // Computed values
  const selectedEquipmentData = equipments?.find(eq => eq.id === formState.selectedEquipment);
  const selectedOrderData = availableOrders.find(o => o.id === formState.selectedOrder);

  return {
    // All form state from the smaller hook
    ...formState,
    
    // Data
    equipments,
    availableOrders,
    
    // Computed values from checklist hook
    ...checklistData,
    selectedEquipmentData,
    selectedOrderData,
    
    // Validation from validation hook (including individual field validations)
    ...validation,
    
    // Handlers from other hooks
    ...qrHandler,
    ...signatureHandler,
  };
};
