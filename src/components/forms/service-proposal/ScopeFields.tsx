
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useSecureEquipments } from '@/hooks/useSecureEquipments';
import FormModal from '@/components/modals/FormModal';
import NewEquipmentForm from '@/components/forms/NewEquipmentForm';

interface ScopeFieldsProps {
  register: any;
  setValue: any;
  watch: any;
  errors: any;
}

const ScopeFields: React.FC<ScopeFieldsProps> = ({ register, setValue, watch, errors }) => {
  const { data: equipments = [], refetch } = useSecureEquipments();
  const [isNewEquipmentModalOpen, setIsNewEquipmentModalOpen] = useState(false);
  const equipmentId = watch('equipment_id');

  const handleNewEquipmentSuccess = (newEquipment: any) => {
    setIsNewEquipmentModalOpen(false);
    refetch();
    setValue('equipment_id', newEquipment.id);
  };

  const handleModalClose = () => {
    setIsNewEquipmentModalOpen(false);
  };

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-evolutec-black">Escopo do Trabalho</h3>
        
        <div className="space-y-2">
          <Label htmlFor="equipment_id">Equipamento</Label>
          <div className="flex gap-2">
            <Select value={equipmentId} onValueChange={(value) => setValue('equipment_id', value)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione um equipamento (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {equipments.map((equipment) => (
                  <SelectItem key={equipment.id} value={equipment.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{equipment.name}</span>
                      <span className="text-xs text-gray-500">
                        {equipment.brand && `${equipment.brand} `}
                        {equipment.model && `- ${equipment.model} `}
                        {equipment.installation_location && `- ${equipment.installation_location}`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewEquipmentModalOpen(true)}
              className="shrink-0"
            >
              <Plus size={16} className="mr-1" />
              Novo
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="scope_of_work">Escopo de Trabalho *</Label>
          <Textarea
            id="scope_of_work"
            {...register('scope_of_work', { required: 'Escopo de trabalho é obrigatório' })}
            placeholder="Descreva detalhadamente os serviços que serão realizados..."
            rows={4}
          />
          {errors.scope_of_work && <p className="text-sm text-red-500">{errors.scope_of_work.message}</p>}
        </div>
      </div>

      <FormModal
        isOpen={isNewEquipmentModalOpen}
        onClose={handleModalClose}
        title="Novo Equipamento"
      >
        <NewEquipmentForm onSuccess={handleNewEquipmentSuccess} />
      </FormModal>
    </>
  );
};

export default ScopeFields;
