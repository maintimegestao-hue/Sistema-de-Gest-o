
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Wrench, CheckCircle } from 'lucide-react';

interface MaintenanceHeaderProps {
  selectedEquipmentName?: string;
  completedItems: number;
  totalItems: number;
  orderNumber?: string;
}

const MaintenanceHeader: React.FC<MaintenanceHeaderProps> = ({
  selectedEquipmentName,
  completedItems,
  totalItems,
  orderNumber
}) => {
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-evolutec-green/10 rounded-lg flex items-center justify-center">
          <Wrench size={24} className="text-evolutec-green" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-evolutec-black">
              Executar Manutenção
            </h1>
            {orderNumber && (
              <span className="px-3 py-1 bg-evolutec-green/10 text-evolutec-green rounded-full text-sm font-medium">
                {orderNumber}
              </span>
            )}
          </div>
          {selectedEquipmentName && (
            <p className="text-evolutec-text mt-1">
              Equipamento: <span className="font-medium">{selectedEquipmentName}</span>
            </p>
          )}
        </div>
      </div>

      {totalItems > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-evolutec-black">
              Progresso do Checklist
            </span>
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-evolutec-green" />
              <span className="text-sm text-evolutec-text">
                {completedItems} de {totalItems} itens
              </span>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}
    </div>
  );
};

export default MaintenanceHeader;
