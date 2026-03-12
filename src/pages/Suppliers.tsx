
import React, { useState } from 'react';
import { Plus, Search, Building, Phone, Mail, MapPin, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSuppliers, useDeleteSupplier, Supplier } from '@/hooks/useSuppliers';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FormModal from '@/components/modals/FormModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { NewSupplierForm } from '@/components/forms/NewSupplierForm';
import { EditSupplierForm } from '@/components/forms/EditSupplierForm';

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [cityFilter, setCityFilter] = useState('');
  
  const { data: suppliers, isLoading } = useSuppliers();
  const deleteSupplier = useDeleteSupplier();

  const filteredSuppliers = suppliers?.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.cnpj?.includes(searchTerm) ||
                         supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = !cityFilter || supplier.city?.toLowerCase().includes(cityFilter.toLowerCase());
    return matchesSearch && matchesCity;
  }) || [];

  const handleDelete = (supplier: Supplier) => {
    if (window.confirm(`Tem certeza que deseja excluir o fornecedor "${supplier.name}"?`)) {
      deleteSupplier.mutate(supplier.id);
    }
  };

  const getSupplyTypeLabel = (types: string[]) => {
    const typeMap: { [key: string]: string } = {
      materials: 'Materiais',
      services: 'Serviços'
    };
    return types.map(type => typeMap[type] || type).join(', ');
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-evolutec-text flex items-center gap-2">
              <Building className="h-6 w-6 text-evolutec-green" />
              Fornecedores
            </h1>
            <p className="text-gray-600 mt-1">Gerencie seus fornecedores de materiais e serviços</p>
          </div>
          <Button onClick={() => setIsNewModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Fornecedor
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, CNPJ ou contato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Filtrar por cidade..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="pl-10 w-full sm:w-48"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold text-evolutec-text">
                    {supplier.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSupplier(supplier)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(supplier)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {supplier.cnpj && (
                  <p className="text-sm text-gray-600">CNPJ: {supplier.cnpj}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {supplier.contact_person && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{supplier.contact_person}</span>
                  </div>
                )}
                
                {supplier.contact_phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{supplier.contact_phone}</span>
                  </div>
                )}
                
                {supplier.contact_email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{supplier.contact_email}</span>
                  </div>
                )}
                
                {(supplier.city || supplier.state) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{[supplier.city, supplier.state].filter(Boolean).join(', ')}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {supplier.supply_types.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {getSupplyTypeLabel([type])}
                    </Badge>
                  ))}
                </div>

                {supplier.notes && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {supplier.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSuppliers.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || cityFilter 
                  ? 'Nenhum fornecedor encontrado com os filtros aplicados.' 
                  : 'Nenhum fornecedor cadastrado ainda.'}
              </p>
              {!searchTerm && !cityFilter && (
                <Button onClick={() => setIsNewModalOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Fornecedor
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <FormModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Novo Fornecedor"
      >
        <NewSupplierForm onSuccess={() => setIsNewModalOpen(false)} />
      </FormModal>

      {editingSupplier && (
        <FormModal
          isOpen={!!editingSupplier}
          onClose={() => setEditingSupplier(null)}
          title="Editar Fornecedor"
        >
          <EditSupplierForm 
            supplier={editingSupplier}
            onSuccess={() => setEditingSupplier(null)} 
          />
        </FormModal>
      )}
    </DashboardLayout>
  );
};

export default Suppliers;
