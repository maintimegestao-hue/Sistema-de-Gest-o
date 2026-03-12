
import React from 'react';
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EquipmentHeaderProps {
  onNewEquipment: () => void;
}

const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({ onNewEquipment }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Equipamentos</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie todos os equipamentos cadastrados
        </p>
      </div>
      <Button 
        className="maintex-btn"
        onClick={onNewEquipment}
      >
        <Plus size={16} className="mr-2" />
        Novo Equipamento
      </Button>
    </div>
  );
};

export default EquipmentHeader;
