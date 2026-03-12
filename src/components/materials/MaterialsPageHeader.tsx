
import React from 'react';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MaterialsPageHeaderProps {
  onNewMaterial: () => void;
  materialsCount: number;
}

export const MaterialsPageHeader = ({ onNewMaterial, materialsCount }: MaterialsPageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          Materiais
        </h1>
        <p className="text-gray-600 mt-1">
          Gerencie seu estoque de materiais e peças ({materialsCount} itens)
        </p>
      </div>
      <Button onClick={onNewMaterial} className="w-full sm:w-auto">
        <Plus className="h-4 w-4 mr-2" />
        Novo Material
      </Button>
    </div>
  );
};
