
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateSecureEquipment } from '@/hooks/useSecureEquipments';
import { Save } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  capacity?: string;
  serial_number?: string;
  status: string;
  client?: string;
  installation_location?: string;
}

interface EditEquipmentFormProps {
  equipment: Equipment;
  onSuccess?: (updatedEquipment: any) => void;
}

interface FormData {
  name: string;
  model: string;
  brand: string;
  capacity: string;
  serial_number: string;
  installation_location: string;
  client: string;
  status: 'operational' | 'maintenance' | 'inactive' | 'broken';
}

const EditEquipmentForm: React.FC<EditEquipmentFormProps> = ({ equipment, onSuccess }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: equipment.name || '',
      model: equipment.model || '',
      brand: equipment.brand || '',
      capacity: equipment.capacity || '',
      serial_number: equipment.serial_number || '',
      installation_location: equipment.installation_location || '',
      client: equipment.client || '',
      status: (equipment.status as 'operational' | 'maintenance' | 'inactive' | 'broken') || 'operational'
    }
  });
  
  const updateEquipment = useUpdateSecureEquipment();
  const status = watch('status');

  const onSubmit = async (data: FormData) => {
    console.log('📝 Form submitted with data:', data);
    
    if (!data.name || data.name.trim() === '') {
      console.log('❌ Name is required');
      return;
    }

    try {
      const cleanData = {
        name: data.name.trim(),
        model: data.model?.trim() || undefined,
        brand: data.brand?.trim() || undefined,
        capacity: data.capacity?.trim() || undefined,
        serial_number: data.serial_number?.trim() || undefined,
        installation_location: data.installation_location?.trim() || undefined,
        client: data.client?.trim() || undefined,
        status: data.status
      };

      console.log('🧹 Cleaned data:', cleanData);

      const updatedEquipment = await updateEquipment.mutateAsync({
        id: equipment.id,
        ...cleanData
      });
      
      console.log('✅ Equipment updated successfully');
      onSuccess?.(updatedEquipment);
    } catch (error) {
      console.error('💥 Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Equipamento *</Label>
        <Input
          id="name"
          {...register('name', { 
            required: 'Nome é obrigatório',
            minLength: { value: 1, message: 'Nome deve ter pelo menos 1 caractere' }
          })}
          placeholder="Ex: Compressor de Ar"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Marca</Label>
          <Input
            id="brand"
            {...register('brand')}
            placeholder="Ex: Carrier, York, Trane"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Modelo</Label>
          <Input
            id="model"
            {...register('model')}
            placeholder="Ex: 30GTN080"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacity">Capacidade</Label>
        <Input
          id="capacity"
          {...register('capacity')}
          placeholder="Ex: 80.000 BTU/h, 7,5 TR"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="serial_number">Número de Série</Label>
        <Input
          id="serial_number"
          {...register('serial_number')}
          placeholder="Ex: SN123456"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="installation_location">Local de Instalação</Label>
        <Input
          id="installation_location"
          {...register('installation_location')}
          placeholder="Ex: Sala de Máquinas - Bloco A"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="client">Cliente</Label>
        <Input
          id="client"
          {...register('client')}
          placeholder="Ex: Empresa ABC Ltda"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value: 'operational' | 'maintenance' | 'inactive' | 'broken') => setValue('status', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="operational">Operacional</SelectItem>
            <SelectItem value="maintenance">Em Manutenção</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
            <SelectItem value="broken">Avariado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="submit"
          disabled={updateEquipment.isPending}
          className="evolutec-btn"
        >
          <Save size={16} className="mr-2" />
          {updateEquipment.isPending ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
};

export default EditEquipmentForm;
