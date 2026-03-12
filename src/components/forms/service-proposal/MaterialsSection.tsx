
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

export interface Material {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface MaterialsSectionProps {
  materials: Material[];
  onAddMaterial: () => void;
  onRemoveMaterial: (index: number) => void;
  onUpdateMaterial: (index: number, field: keyof Material, value: string | number) => void;
}

const MaterialsSection: React.FC<MaterialsSectionProps> = ({
  materials,
  onAddMaterial,
  onRemoveMaterial,
  onUpdateMaterial
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Materiais</h3>
        <Button type="button" onClick={onAddMaterial} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Material
        </Button>
      </div>

      {materials.map((material, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
          <div className="md:col-span-2">
            <Input
              placeholder="Descrição do material"
              value={material.description}
              onChange={(e) => onUpdateMaterial(index, 'description', e.target.value)}
            />
          </div>
          <Input
            type="number"
            placeholder="Qtd"
            value={material.quantity}
            onChange={(e) => onUpdateMaterial(index, 'quantity', parseFloat(e.target.value) || 0)}
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Preço Unit."
            value={material.unit_price}
            onChange={(e) => onUpdateMaterial(index, 'unit_price', parseFloat(e.target.value) || 0)}
          />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder="Total"
              value={material.total.toFixed(2)}
              readOnly
            />
            <Button
              type="button"
              onClick={() => onRemoveMaterial(index)}
              variant="outline"
              size="sm"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaterialsSection;
