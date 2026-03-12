import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateService } from '@/hooks/useServices';

interface QuickServiceFormProps {
  onSuccess: (service: any) => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  service_type: string;
  complexity_level: string;
  base_price: number;
  estimated_time: number;
  description?: string;
  recommended_team?: string;
}

const QuickServiceForm: React.FC<QuickServiceFormProps> = ({ onSuccess, onCancel }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>();
  const createService = useCreateService();

  const serviceType = watch('service_type');
  const complexityLevel = watch('complexity_level');

  const onSubmit = async (data: FormData) => {
    try {
      const serviceData = {
        ...data,
        supplier_id: undefined,
      };

      const result = await createService.mutateAsync(serviceData);
      onSuccess(result);
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Serviço *</Label>
        <Input
          id="name"
          {...register('name', { required: 'Nome é obrigatório' })}
          placeholder="Ex: Manutenção Preventiva em Motor"
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="service_type">Tipo de Serviço *</Label>
          <Select value={serviceType} onValueChange={(value) => setValue('service_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preventive">Preventiva</SelectItem>
              <SelectItem value="corrective">Corretiva</SelectItem>
              <SelectItem value="predictive">Preditiva</SelectItem>
              <SelectItem value="installation">Instalação</SelectItem>
              <SelectItem value="inspection">Inspeção</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="complexity_level">Nível de Complexidade *</Label>
          <Select value={complexityLevel} onValueChange={(value) => setValue('complexity_level', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a complexidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="base_price">Preço Base (R$) *</Label>
          <Input
            id="base_price"
            type="number"
            step="0.01"
            {...register('base_price', { 
              required: 'Preço é obrigatório',
              min: { value: 0, message: 'Preço deve ser maior que zero' }
            })}
            placeholder="0,00"
          />
          {errors.base_price && <p className="text-sm text-red-500">{errors.base_price.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimated_time">Tempo Estimado (horas) *</Label>
          <Input
            id="estimated_time"
            type="number"
            {...register('estimated_time', { 
              required: 'Tempo estimado é obrigatório',
              min: { value: 0.5, message: 'Tempo deve ser maior que 0,5 horas' }
            })}
            placeholder="2"
          />
          {errors.estimated_time && <p className="text-sm text-red-500">{errors.estimated_time.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recommended_team">Equipe Recomendada</Label>
        <Input
          id="recommended_team"
          {...register('recommended_team')}
          placeholder="Ex: 1 Técnico Sênior + 1 Auxiliar"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição do Serviço</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Descrição detalhada do serviço..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={createService.isPending}>
          {createService.isPending ? 'Salvando...' : 'Salvar Serviço'}
        </Button>
      </div>
    </form>
  );
};

export default QuickServiceForm;