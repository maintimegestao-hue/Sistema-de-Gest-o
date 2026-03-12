import React, { useState } from 'react';
import { Plus, Search, Hammer, Edit, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useServices, useDeleteService } from '@/hooks/useServices';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FormModal from '@/components/modals/FormModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { NewServiceForm } from '@/components/forms/NewServiceForm';
import { EditServiceForm } from '@/components/forms/EditServiceForm';

interface Service {
  id: string;
  name: string;
  description?: string;
  service_type?: string;
  base_price?: number;
  estimated_time?: number;
  complexity_level?: string;
  recommended_team?: string;
  supplier?: { name: string };
}

const Services = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  
  const { data: services, isLoading } = useServices();
  const deleteService = useDeleteService();

  const filteredServices = services?.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || service.service_type?.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesType;
  }) || [];

  const handleDelete = (service: Service) => {
    if (window.confirm(`Tem certeza que deseja excluir o serviço "${service.name}"?`)) {
      deleteService.mutate(service.id);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'R$ 0,00';
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatTime = (time?: number) => {
    if (!time) return 'Não definido';
    if (time < 60) return `${time} min`;
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
  };

  const getServiceTypeLabel = (type?: string) => {
    const typeMap: { [key: string]: { label: string; color: string } } = {
      'corrective': { label: 'Corretiva', color: 'bg-red-100 text-red-800' },
      'preventive': { label: 'Preventiva', color: 'bg-green-100 text-green-800' },
      'installation': { label: 'Instalação', color: 'bg-blue-100 text-blue-800' },
      'project': { label: 'Projeto', color: 'bg-purple-100 text-purple-800' },
    };
    return typeMap[type || 'corrective'] || { label: type || 'Não definido', color: 'bg-gray-100 text-gray-800' };
  };

  const getComplexityColor = (level?: string) => {
    const complexityMap: { [key: string]: string } = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800',
    };
    return complexityMap[level || 'medium'] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-evolutec-text flex items-center gap-2">
              <Hammer className="h-6 w-6 text-evolutec-green" />
              Serviços
            </h1>
            <p className="text-gray-600 mt-1">Gerencie seus serviços padronizados</p>
          </div>
          <Button onClick={() => setIsNewModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Serviço
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Input
                placeholder="Filtrar por tipo..."
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full sm:w-48"
              />
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const serviceType = getServiceTypeLabel(service.service_type);
            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-evolutec-text">
                      {service.name}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingService(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(service)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={`text-xs ${serviceType.color}`}>
                      {serviceType.label}
                    </Badge>
                    {service.complexity_level && (
                      <Badge className={`text-xs ${getComplexityColor(service.complexity_level)}`}>
                        {service.complexity_level === 'low' ? 'Baixa' : 
                         service.complexity_level === 'medium' ? 'Média' : 
                         service.complexity_level === 'high' ? 'Alta' : service.complexity_level}
                      </Badge>
                    )}
                  </div>

                  {service.description && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {service.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Tempo estimado:
                      </span>
                      <span className="text-sm font-medium">{formatTime(service.estimated_time)}</span>
                    </div>
                  </div>

                  {service.recommended_team && (
                    <p className="text-sm text-gray-600">
                      <strong>Equipe recomendada:</strong> {service.recommended_team}
                    </p>
                  )}

                  {service.supplier && (
                    <p className="text-sm text-gray-600">
                      <strong>Fornecedor:</strong> {service.supplier.name}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Hammer className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || typeFilter 
                  ? 'Nenhum serviço encontrado com os filtros aplicados.' 
                  : 'Nenhum serviço cadastrado ainda.'}
              </p>
              {!searchTerm && !typeFilter && (
                <Button onClick={() => setIsNewModalOpen(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Serviço
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
        title="Novo Serviço"
      >
        <NewServiceForm onSuccess={() => setIsNewModalOpen(false)} />
      </FormModal>

      {editingService && (
        <FormModal
          isOpen={!!editingService}
          onClose={() => setEditingService(null)}
          title="Editar Serviço"
        >
          <EditServiceForm 
            service={editingService}
            onSuccess={() => setEditingService(null)} 
          />
        </FormModal>
      )}
    </DashboardLayout>
  );
};

export default Services;
