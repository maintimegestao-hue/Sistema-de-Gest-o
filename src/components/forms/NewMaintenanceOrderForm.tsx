
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateMaintenanceOrder } from '@/hooks/useMaintenanceOrders';
import { useSecureEquipments } from '@/hooks/useSecureEquipments';
import { useTechnicians } from '@/hooks/useTechnicians';

interface NewMaintenanceOrderFormProps {
  onSuccess?: () => void;
}

interface FormData {
  equipment_id: string;
  technician_id: string;
  description: string;
  priority: string;
  maintenance_type: string;
  scheduled_date: string;
  status: string;
}

const NewMaintenanceOrderForm: React.FC<NewMaintenanceOrderFormProps> = ({ onSuccess }) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      priority: 'medium',
      maintenance_type: 'preventive',
      status: 'pending'
    }
  });
  
  const createMaintenanceOrder = useCreateMaintenanceOrder();
  const { data: equipments } = useSecureEquipments();
  const { data: technicians } = useTechnicians();
  
  const priority = watch('priority');
  const maintenanceType = watch('maintenance_type');
  const equipmentId = watch('equipment_id');
  const technicianId = watch('technician_id');

  const onSubmit = async (data: FormData) => {
    try {
      await createMaintenanceOrder.mutateAsync(data);
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar ordem de serviço:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="equipment_id">Equipamento *</Label>
        <Select value={equipmentId} onValueChange={(value) => setValue('equipment_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o equipamento" />
          </SelectTrigger>
          <SelectContent>
            {equipments?.map((equipment) => (
              <SelectItem key={equipment.id} value={equipment.id}>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{equipment.name}</span>
                  <span className="text-xs text-gray-500">
                    {equipment.installation_location || 'Local não informado'}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.equipment_id && <p className="text-sm text-red-500">Equipamento é obrigatório</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="technician_id">Técnico Responsável *</Label>
        <Select value={technicianId} onValueChange={(value) => setValue('technician_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o técnico" />
          </SelectTrigger>
          <SelectContent>
            {technicians?.map((technician) => (
              <SelectItem key={technician.id} value={technician.id}>
                {technician.name} - {technician.specialization}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.technician_id && <p className="text-sm text-red-500">Técnico é obrigatório</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="maintenance_type">Tipo de Manutenção</Label>
        <Select value={maintenanceType} onValueChange={(value) => setValue('maintenance_type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="preventive">Preventiva</SelectItem>
            <SelectItem value="corrective">Corretiva</SelectItem>
            <SelectItem value="predictive">Preditiva</SelectItem>
            <SelectItem value="emergency">Emergencial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Prioridade</Label>
        <Select value={priority} onValueChange={(value) => setValue('priority', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="critical">Crítica</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="scheduled_date">Data Agendada</Label>
        <Input
          id="scheduled_date"
          type="date"
          {...register('scheduled_date')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          {...register('description', { required: 'Descrição é obrigatória' })}
          placeholder="Descreva o serviço a ser realizado..."
          rows={4}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="submit"
          disabled={createMaintenanceOrder.isPending}
          className="evolutec-btn"
        >
          {createMaintenanceOrder.isPending ? 'Salvando...' : 'Criar Ordem de Serviço'}
        </Button>
      </div>
    </form>
  );
};

export default NewMaintenanceOrderForm;
