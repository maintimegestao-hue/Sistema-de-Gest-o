
import React from 'react';
import { QrCode, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EquipmentEmptyStateProps {
  hasFilters: boolean;
  onNewEquipment: () => void;
}

const EquipmentEmptyState: React.FC<EquipmentEmptyStateProps> = ({
  hasFilters,
  onNewEquipment
}) => {
  return (
    <div className="text-center py-8">
      <QrCode size={48} className="mx-auto text-gray-400 mb-4" />
      <p className="text-evolutec-text mb-4">
        {hasFilters 
          ? 'Nenhum equipamento encontrado com os filtros aplicados' 
          : 'Nenhum equipamento cadastrado ainda'}
      </p>
      <Button 
        className="evolutec-btn"
        onClick={onNewEquipment}
      >
        <Plus size={16} className="mr-2" />
        Cadastrar Primeiro Equipamento
      </Button>
    </div>
  );
};

export default EquipmentEmptyState;
