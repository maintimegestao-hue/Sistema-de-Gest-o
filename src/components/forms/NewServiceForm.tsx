
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateService } from '@/hooks/useServices';
import { useSuppliers } from '@/hooks/useSuppliers';
import { toast } from 'sonner';

const serviceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  service_type: z.string().optional(),
  base_price: z.number().min(0, 'Preço deve ser positivo').optional(),
  estimated_time: z.number().min(0, 'Tempo deve ser positivo').optional(),
  complexity_level: z.string().optional(),
  recommended_team: z.string().optional(),
  supplier_id: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface NewServiceFormProps {
  onSuccess: () => void;
}

export const NewServiceForm = ({ onSuccess }: NewServiceFormProps) => {
  const { data: suppliers } = useSuppliers();
  const createService = useCreateService();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  const onSubmit = async (data: ServiceFormData) => {
    try {
      await createService.mutateAsync({
        name: data.name,
        description: data.description || undefined,
        service_type: data.service_type || undefined,
        base_price: data.base_price || undefined,
        estimated_time: data.estimated_time || undefined,
        complexity_level: data.complexity_level || undefined,
        recommended_team: data.recommended_team || undefined,
        supplier_id: data.supplier_id === 'none' ? undefined : data.supplier_id,
      });
      onSuccess();
    } catch (error) {
      toast.error('Erro ao criar serviço');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Serviço *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Ex: Manutenção preventiva de ar condicionado"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Descrição Técnica</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Descrição detalhada do serviço..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="service_type">Tipo de Serviço</Label>
          <Select
            value={watch('service_type')}
            onValueChange={(value) => setValue('service_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maintenance">Manutenção</SelectItem>
              <SelectItem value="installation">Instalação</SelectItem>
              <SelectItem value="repair">Reparo</SelectItem>
              <SelectItem value="inspection">Inspeção</SelectItem>
              <SelectItem value="cleaning">Limpeza</SelectItem>
              <SelectItem value="calibration">Calibração</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="complexity_level">Nível de Complexidade</Label>
          <Select
            value={watch('complexity_level')}
            onValueChange={(value) => setValue('complexity_level', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a complexidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="base_price">Preço Base (R$)</Label>
          <Input
            id="base_price"
            type="number"
            step="0.01"
            {...register('base_price', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="estimated_time">Tempo Estimado (horas)</Label>
          <Input
            id="estimated_time"
            type="number"
            step="0.5"
            {...register('estimated_time', { valueAsNumber: true })}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="recommended_team">Equipe Recomendada</Label>
        <Input
          id="recommended_team"
          {...register('recommended_team')}
          placeholder="Ex: 1 técnico especialista + 1 auxiliar"
        />
      </div>

      <div>
        <Label htmlFor="supplier_id">Fornecedor</Label>
        <Select
          value={watch('supplier_id')}
          onValueChange={(value) => setValue('supplier_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um fornecedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhum fornecedor</SelectItem>
            {suppliers?.filter(s => s.supply_types.includes('services')).map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando...' : 'Criar Serviço'}
        </Button>
      </div>
    </form>
  );
};
