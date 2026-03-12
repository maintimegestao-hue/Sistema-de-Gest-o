
import React from 'react';
import { Material } from './MaterialsSection';

interface CostSummaryProps {
  materials: Material[];
  laborCost: number;
}

const CostSummary: React.FC<CostSummaryProps> = ({ materials, laborCost }) => {
  const materialsCost = materials.reduce((sum, m) => sum + m.total, 0);
  const totalCost = materialsCost + laborCost;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">Resumo de Custos</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Materiais:</span>
          <span>R$ {materialsCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Mão de obra:</span>
          <span>R$ {laborCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold border-t pt-1">
          <span>Total:</span>
          <span>R$ {totalCost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CostSummary;
