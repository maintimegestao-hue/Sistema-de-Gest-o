
import React from 'react';
import EquipmentCard from './EquipmentCard';
import EquipmentEmptyState from './EquipmentEmptyState';

interface Equipment {
  id: string;
  name: string;
  qr_code?: string;
  serial_number?: string;
  status: string;
  client?: string;
  installation_location?: string;
}

interface EquipmentGridProps {
  equipments: Equipment[] | undefined;
  isLoading: boolean;
  hasFilters: boolean;
  onGenerateLabel: (equipment: Equipment) => void;
  onDelete: (id: string) => void;
  onEdit: (equipment: Equipment) => void;
  onNewEquipment: () => void;
}

const EquipmentGrid: React.FC<EquipmentGridProps> = ({
  equipments,
  isLoading,
  hasFilters,
  onGenerateLabel,
  onDelete,
  onEdit,
  onNewEquipment
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-evolutec-text">Carregando equipamentos...</p>
      </div>
    );
  }

  if (!equipments || equipments.length === 0) {
    return (
      <EquipmentEmptyState 
        hasFilters={hasFilters}
        onNewEquipment={onNewEquipment}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {equipments.map((equipment) => (
        <EquipmentCard
          key={equipment.id}
          equipment={equipment}
          onGenerateLabel={onGenerateLabel}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

export default EquipmentGrid;
