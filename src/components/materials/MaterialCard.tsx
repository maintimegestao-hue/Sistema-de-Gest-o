
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface MaterialCardProps {
  material: Material;
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
}

export const MaterialCard = ({ material, onEdit, onDelete }: MaterialCardProps) => {
  const formatPrice = (price?: number) => {
    if (!price) return 'R$ 0,00';
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStockStatus = (current?: number, minimum?: number) => {
    if (!current) return { label: 'Sem estoque', color: 'bg-red-100 text-red-800' };
    if (minimum && current <= minimum) return { label: 'Estoque baixo', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Em estoque', color: 'bg-green-100 text-green-800' };
  };

  const stockStatus = getStockStatus(material.stock_quantity);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-evolutec-text">
            {material.name}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(material)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(material)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {material.internal_code && (
          <p className="text-sm text-gray-600">Código: {material.internal_code}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {material.brand && material.model && (
          <p className="text-sm text-gray-600">
            <strong>Marca/Modelo:</strong> {material.brand} - {material.model}
          </p>
        )}
        
        {material.category && (
          <Badge variant="outline" className="text-xs">
            {material.category}
          </Badge>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Preço:</span>
            <span className="font-semibold text-evolutec-green">
              {formatPrice(material.unit_price)}
            </span>
          </div>
          
          {material.unit_of_measure && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Unidade:</span>
              <span className="text-sm">{material.unit_of_measure}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Estoque:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{material.stock_quantity || 0}</span>
              <Badge className={`text-xs ${stockStatus.color}`}>
                {stockStatus.label}
              </Badge>
            </div>
          </div>
        </div>

        {material.physical_location && (
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <strong>Localização:</strong> {material.physical_location}
          </p>
        )}

        {material.supplier && (
          <p className="text-sm text-gray-600">
            <strong>Fornecedor:</strong> {material.supplier.name}
          </p>
        )}

        {material.technical_description && (
          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            {material.technical_description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
