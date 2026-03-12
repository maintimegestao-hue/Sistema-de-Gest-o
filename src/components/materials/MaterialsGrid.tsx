
import React from 'react';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MaterialCard } from './MaterialCard';

interface Material {
  id: string;
  name: string;
  internal_code?: string;
  category?: string;
  unit_of_measure?: string;
  brand?: string;
  model?: string;
  technical_description?: string;
  unit_price?: number;
  stock_quantity?: number;
  physical_location?: string;
  supplier?: { name: string };
}

interface MaterialsGridProps {
  materials: Material[];
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
  onNewMaterial: () => void;
  searchTerm: string;
  categoryFilter: string;
}

export const MaterialsGrid = ({ 
  materials, 
  onEdit, 
  onDelete, 
  onNewMaterial, 
  searchTerm, 
  categoryFilter 
}: MaterialsGridProps) => {
  if (materials.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm || categoryFilter 
              ? 'Nenhum material encontrado com os filtros aplicados.' 
              : 'Nenhum material cadastrado ainda.'}
          </p>
          {!searchTerm && !categoryFilter && (
            <Button onClick={onNewMaterial} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Material
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {materials.map((material) => (
        <MaterialCard
          key={material.id}
          material={material}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
