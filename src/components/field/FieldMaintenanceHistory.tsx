import React from 'react';
import FieldMaintenanceHistoryView from './FieldMaintenanceHistoryView';

interface FieldMaintenanceHistoryProps {
  onBack: () => void;
}

const FieldMaintenanceHistory: React.FC<FieldMaintenanceHistoryProps> = ({ onBack }) => {
  return <FieldMaintenanceHistoryView onBack={onBack} />;
};

export default FieldMaintenanceHistory;