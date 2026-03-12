
import { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export const useMaintenanceFormState = () => {
  const signatureRef = useRef<SignatureCanvas>(null);
  
  const [selectedOrder, setSelectedOrder] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [maintenanceType, setMaintenanceType] = useState('');
  const [periodicity, setPeriodicity] = useState('');
  const [checklist, setChecklist] = useState<{[key: string]: any}>({});
  const [observations, setObservations] = useState('');
  const [technicianSignature, setTechnicianSignature] = useState('');
  const [digitalSignature, setDigitalSignature] = useState('');
  const [attachments, setAttachments] = useState<Array<{file: File, comment: string, type: 'photo' | 'video'}>>([]);
  
  // Campos de data/hora
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleMaintenanceTypeReset = () => {
    setPeriodicity('');
    setChecklist({});
  };

  const handlePeriodicityReset = () => {
    setChecklist({});
  };

  const handleChecklistChange = (item: string, data: any) => {
    console.log('Checklist change:', { item, data });
    setChecklist(prev => {
      const newChecklist = {
        ...prev,
        [item]: data
      };
      console.log('New checklist state:', newChecklist);
      return newChecklist;
    });
  };

  return {
    // State
    selectedOrder,
    setSelectedOrder,
    selectedEquipment,
    setSelectedEquipment,
    showQRScanner,
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
    setDigitalSignature,
    attachments,
    setAttachments,
    signatureRef,
    
    // Data/hora fields
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    
    // Handlers
    handleMaintenanceTypeReset,
    handlePeriodicityReset,
    handleChecklistChange,
  };
};
