
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { useMaterials } from '@/hooks/useMaterials';
import { useServices } from '@/hooks/useServices';
import { Control, useFieldArray } from 'react-hook-form';
import QuickMaterialForm from '@/components/forms/QuickMaterialForm';
import QuickServiceForm from '@/components/forms/QuickServiceForm';

interface MaterialsAndServicesSectionProps {
  control: Control<any>;
  watch: (name: string) => any;
  setValue: (name: string, value: any) => void;
}

interface SelectedMaterial {
  material_id: string;
  custom_description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface SelectedService {
  service_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const MaterialsAndServicesSection: React.FC<MaterialsAndServicesSectionProps> = ({
  control,
  watch,
  setValue
}) => {
  const { data: materials = [], refetch: refetchMaterials } = useMaterials();
  const { data: services = [], refetch: refetchServices } = useServices();
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [pendingMaterialIndex, setPendingMaterialIndex] = useState<number | null>(null);
  const [pendingServiceIndex, setPendingServiceIndex] = useState<number | null>(null);

  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({
    control,
    name: 'selected_materials'
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control,
    name: 'selected_services'
  });

  const selectedMaterials = watch('selected_materials') || [];
  const selectedServices = watch('selected_services') || [];

  const addMaterial = () => {
    appendMaterial({
      material_id: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0
    });
  };

  const addService = () => {
    appendService({
      service_id: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0
    });
  };

  const updateMaterialPrice = (index: number, materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      const quantity = selectedMaterials[index]?.quantity || 1;
      const unitPrice = material.unit_price || 0;
      const totalPrice = quantity * unitPrice;
      
      setValue(`selected_materials.${index}.unit_price`, unitPrice);
      setValue(`selected_materials.${index}.total_price`, totalPrice);
    }
  };

  const updateServicePrice = (index: number, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      const quantity = selectedServices[index]?.quantity || 1;
      const unitPrice = service.base_price || 0;
      const totalPrice = quantity * unitPrice;
      
      setValue(`selected_services.${index}.unit_price`, unitPrice);
      setValue(`selected_services.${index}.total_price`, totalPrice);
    }
  };

  const updateMaterialQuantity = (index: number, quantity: number) => {
    const unitPrice = selectedMaterials[index]?.unit_price || 0;
    const totalPrice = quantity * unitPrice;
    setValue(`selected_materials.${index}.total_price`, totalPrice);
  };

  const updateServiceQuantity = (index: number, quantity: number) => {
    const unitPrice = selectedServices[index]?.unit_price || 0;
    const totalPrice = quantity * unitPrice;
    setValue(`selected_services.${index}.total_price`, totalPrice);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const handleMaterialCreated = async (newMaterial: any) => {
    await refetchMaterials();
    if (pendingMaterialIndex !== null) {
      setValue(`selected_materials.${pendingMaterialIndex}.material_id`, newMaterial.id);
      updateMaterialPrice(pendingMaterialIndex, newMaterial.id);
      setPendingMaterialIndex(null);
    }
    setShowMaterialModal(false);
  };

  const handleServiceCreated = async (newService: any) => {
    await refetchServices();
    if (pendingServiceIndex !== null) {
      setValue(`selected_services.${pendingServiceIndex}.service_id`, newService.id);
      updateServicePrice(pendingServiceIndex, newService.id);
      setPendingServiceIndex(null);
    }
    setShowServiceModal(false);
  };

  const openMaterialModal = (index: number) => {
    setPendingMaterialIndex(index);
    setShowMaterialModal(true);
  };

  const openServiceModal = (index: number) => {
    setPendingServiceIndex(index);
    setShowServiceModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Seção de Materiais */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold text-evolutec-black">Materiais</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMaterial}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Adicionar Material
          </Button>
        </div>

        {materialFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
            <div>
              <Label htmlFor={`material-${index}`}>Material</Label>
              <div className="space-y-2">
                <Select
                  value={selectedMaterials[index]?.material_id || ''}
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setValue(`selected_materials.${index}.material_id`, '');
                      setValue(`selected_materials.${index}.custom_description`, '');
                      setValue(`selected_materials.${index}.unit_price`, 0);
                      openMaterialModal(index);
                    } else {
                      setValue(`selected_materials.${index}.material_id`, value);
                      setValue(`selected_materials.${index}.custom_description`, '');
                      updateMaterialPrice(index, value);
                    }
                  }}
                >
                  <SelectTrigger id={`material-${index}`}>
                    <SelectValue placeholder="Selecione um material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name} - {formatCurrency(material.unit_price || 0)}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom" onClick={() => openMaterialModal(index)}>
                      + Adicionar novo material
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Campo para inserir descrição de novo material */}
                {!selectedMaterials[index]?.material_id && (
                  <Input
                    placeholder="Digite a descrição do novo material"
                    value={selectedMaterials[index]?.custom_description || ''}
                    onChange={(e) => {
                      setValue(`selected_materials.${index}.custom_description`, e.target.value);
                    }}
                  />
                )}
              </div>
            </div>

            <div>
              <Label htmlFor={`material-quantity-${index}`}>Quantidade</Label>
              <Input
                id={`material-quantity-${index}`}
                type="number"
                min="1"
                step="0.01"
                value={selectedMaterials[index]?.quantity || 1}
                onChange={(e) => {
                  const quantity = parseFloat(e.target.value) || 1;
                  setValue(`selected_materials.${index}.quantity`, quantity);
                  updateMaterialQuantity(index, quantity);
                }}
              />
            </div>

            <div>
              <Label htmlFor={`material-unit-price-${index}`}>Preço Unitário</Label>
              <Input
                id={`material-unit-price-${index}`}
                type="number"
                min="0"
                step="0.01"
                value={selectedMaterials[index]?.unit_price || 0}
                onChange={(e) => {
                  const unitPrice = parseFloat(e.target.value) || 0;
                  setValue(`selected_materials.${index}.unit_price`, unitPrice);
                  const quantity = selectedMaterials[index]?.quantity || 1;
                  setValue(`selected_materials.${index}.total_price`, quantity * unitPrice);
                }}
              />
            </div>

            <div>
              <Label>Total</Label>
              <div className="h-10 flex items-center font-semibold text-evolutec-green">
                {formatCurrency(selectedMaterials[index]?.total_price || 0)}
              </div>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeMaterial(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Seção de Serviços */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold text-evolutec-black">Serviços</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addService}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Adicionar Serviço
          </Button>
        </div>

        {serviceFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
            <div>
              <Label htmlFor={`service-${index}`}>Serviço</Label>
              <Select
                value={selectedServices[index]?.service_id || ''}
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setValue(`selected_services.${index}.service_id`, '');
                    setValue(`selected_services.${index}.unit_price`, 0);
                    setValue(`selected_services.${index}.total_price`, 0);
                    openServiceModal(index);
                  } else {
                    setValue(`selected_services.${index}.service_id`, value);
                    updateServicePrice(index, value);
                  }
                }}
              >
                <SelectTrigger id={`service-${index}`}>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - {formatCurrency(service.base_price || 0)}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom" onClick={() => openServiceModal(index)}>
                    + Adicionar novo serviço
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`service-quantity-${index}`}>Quantidade</Label>
              <Input
                id={`service-quantity-${index}`}
                type="number"
                min="1"
                step="0.01"
                value={selectedServices[index]?.quantity || 1}
                onChange={(e) => {
                  const quantity = parseFloat(e.target.value) || 1;
                  setValue(`selected_services.${index}.quantity`, quantity);
                  updateServiceQuantity(index, quantity);
                }}
              />
            </div>

            <div>
              <Label htmlFor={`service-unit-price-${index}`}>Preço Unitário</Label>
              <Input
                id={`service-unit-price-${index}`}
                type="number"
                min="0"
                step="0.01"
                value={selectedServices[index]?.unit_price || 0}
                onChange={(e) => {
                  const unitPrice = parseFloat(e.target.value) || 0;
                  setValue(`selected_services.${index}.unit_price`, unitPrice);
                  const quantity = selectedServices[index]?.quantity || 1;
                  setValue(`selected_services.${index}.total_price`, quantity * unitPrice);
                }}
              />
            </div>

            <div>
              <Label>Total</Label>
              <div className="h-10 flex items-center font-semibold text-evolutec-green">
                {formatCurrency(selectedServices[index]?.total_price || 0)}
              </div>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeService(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para adicionar novo material */}
      <Dialog open={showMaterialModal} onOpenChange={setShowMaterialModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Material</DialogTitle>
          </DialogHeader>
          <QuickMaterialForm
            onSuccess={handleMaterialCreated}
            onCancel={() => {
              setShowMaterialModal(false);
              setPendingMaterialIndex(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para adicionar novo serviço */}
      <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Serviço</DialogTitle>
          </DialogHeader>
          <QuickServiceForm
            onSuccess={handleServiceCreated}
            onCancel={() => {
              setShowServiceModal(false);
              setPendingServiceIndex(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialsAndServicesSection;
