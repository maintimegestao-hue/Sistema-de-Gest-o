
import React, { useState } from 'react';
import { useMaterials, useDeleteMaterial } from '@/hooks/useMaterials';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FormModal from '@/components/modals/FormModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { NewMaterialForm } from '@/components/forms/NewMaterialForm';
import { EditMaterialForm } from '@/components/forms/EditMaterialForm';
import { MaterialsPageHeader } from '@/components/materials/MaterialsPageHeader';
import { MaterialsFilters } from '@/components/materials/MaterialsFilters';
import { MaterialsGrid } from '@/components/materials/MaterialsGrid';

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

const Materials = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const { data: materials, isLoading } = useMaterials();
  const deleteMaterial = useDeleteMaterial();

  const filteredMaterials = materials?.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.internal_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || material.category?.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  }) || [];

  const handleDelete = (material: Material) => {
    if (window.confirm(`Tem certeza que deseja excluir o material "${material.name}"?`)) {
      deleteMaterial.mutate(material.id);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <MaterialsPageHeader 
          onNewMaterial={() => setIsNewModalOpen(true)}
          materialsCount={materials?.length || 0}
        />

        <MaterialsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />

        <MaterialsGrid
          materials={filteredMaterials}
          onEdit={setEditingMaterial}
          onDelete={handleDelete}
          onNewMaterial={() => setIsNewModalOpen(true)}
          searchTerm={searchTerm}
          categoryFilter={categoryFilter}
        />
      </div>

      <FormModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Novo Material"
      >
        <NewMaterialForm onSuccess={() => setIsNewModalOpen(false)} />
      </FormModal>

      {editingMaterial && (
        <FormModal
          isOpen={!!editingMaterial}
          onClose={() => setEditingMaterial(null)}
          title="Editar Material"
        >
          <EditMaterialForm 
            material={editingMaterial}
            onSuccess={() => setEditingMaterial(null)} 
          />
        </FormModal>
      )}
    </DashboardLayout>
  );
};

export default Materials;
