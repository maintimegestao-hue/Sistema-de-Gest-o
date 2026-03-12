
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateSecureEquipment } from '@/hooks/useSecureEquipments';
import ClientSelector from '@/components/forms/ClientSelector';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { toast } from 'sonner';

interface NewEquipmentFormProps {
  onSuccess?: (newEquipment: any) => void;
}

interface FormData {
  name: string;
  model: string;
  brand: string;
  capacity: string;
  serial_number: string;
  installation_location: string;
  client_id: string;
  status: 'operational' | 'maintenance' | 'inactive' | 'broken';
}

const NewEquipmentForm: React.FC<NewEquipmentFormProps> = ({ onSuccess }) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      status: 'operational',
      name: '',
      model: '',
      brand: '',
      capacity: '',
      serial_number: '',
      installation_location: '',
      client_id: ''
    }
  });
  
  const createEquipment = useCreateSecureEquipment();
  const { data: planLimits } = usePlanLimits();
  const { isAdmin } = useAdminAccess();
  const status = watch('status');
  const clientId = watch('client_id');

  const onSubmit = async (data: FormData) => {
    console.log('📝 Form submitted with data:', data);
    
    // 🚀 Administradores podem adicionar equipamentos ilimitados
    if (!isAdmin && planLimits && !planLimits.can_add_equipment) {
      toast.error(`Limite de equipamentos atingido! Seu plano permite apenas ${planLimits.max_equipments} equipamentos. Faça upgrade do seu plano para cadastrar mais.`);
      return;
    }
    
    // Validar se os campos obrigatórios foram preenchidos
    if (!data.name || data.name.trim() === '') {
      console.log('❌ Name is required');
      return;
    }

    if (!data.client_id || data.client_id.trim() === '') {
      console.log('❌ Client is required');
      return;
    }

    try {
      // Limpar dados vazios antes de enviar
      const cleanData = {
        name: data.name.trim(),
        model: data.model?.trim() || undefined,
        brand: data.brand?.trim() || undefined,
        capacity: data.capacity?.trim() || undefined,
        serial_number: data.serial_number?.trim() || undefined,
        installation_location: data.installation_location?.trim() || undefined,
        client_id: data.client_id,
        status: data.status
      };

      console.log('🧹 Cleaned data:', cleanData);

      const newEquipment = await createEquipment.mutateAsync(cleanData);
      console.log('✅ Equipment created, resetting form');
      reset();
      onSuccess?.(newEquipment);
    } catch (error) {
      console.error('💥 Form submission error:', error);
      // O erro já é tratado no hook, não precisamos fazer nada aqui
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

      <ClientSelector
        value={clientId}
        onValueChange={(value) => setValue('client_id', value)}
        required={true}
      />
      {errors.client_id && <p className="text-sm text-red-500">{errors.client_id.message}</p>}

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
          disabled={createEquipment.isPending}
          className="evolutec-btn"
        >
          {createEquipment.isPending ? 'Salvando...' : 'Salvar Equipamento'}
        </Button>
      </div>
    </form>
  );
};

export default NewEquipmentForm;
