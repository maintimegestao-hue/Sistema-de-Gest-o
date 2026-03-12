
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTechnician } from '@/hooks/useTechnicians';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { toast } from 'sonner';

interface NewTechnicianFormProps {
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  specialization: string;
  status: string;
}

const NewTechnicianForm: React.FC<NewTechnicianFormProps> = ({ onSuccess }) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      status: 'available'
    }
  });
  
  const createTechnician = useCreateTechnician();
  const { data: planLimits } = usePlanLimits();
  const { isAdmin } = useAdminAccess();
  const status = watch('status');
  const specialization = watch('specialization');

  const onSubmit = async (data: FormData) => {
    // 🚀 Administradores podem adicionar técnicos ilimitados
    if (!isAdmin && planLimits && !planLimits.can_add_technician) {
      toast.error(`Limite de técnicos atingido! Seu plano permite apenas ${planLimits.max_technicians} técnicos. Faça upgrade do seu plano para cadastrar mais.`);
      return;
    }

    try {
      await createTechnician.mutateAsync(data);
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar técnico:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo *</Label>
        <Input
          id="name"
          {...register('name', { required: 'Nome é obrigatório' })}
          placeholder="Ex: João Silva"
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder="Ex: (11) 99999-9999"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="Ex: joao@empresa.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialization">Especialização</Label>
        <Select value={specialization} onValueChange={(value) => setValue('specialization', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a especialização" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mechanical">Mecânica</SelectItem>
            <SelectItem value="electrical">Elétrica</SelectItem>
            <SelectItem value="hydraulic">Hidráulica</SelectItem>
            <SelectItem value="automation">Automação</SelectItem>
            <SelectItem value="welding">Soldagem</SelectItem>
            <SelectItem value="instrumentation">Instrumentação</SelectItem>
            <SelectItem value="general">Geral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value) => setValue('status', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Disponível</SelectItem>
            <SelectItem value="busy">Em Serviço</SelectItem>
            <SelectItem value="vacation">Férias</SelectItem>
            <SelectItem value="sick">Licença Médica</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="submit"
          disabled={createTechnician.isPending}
          className="evolutec-btn"
        >
          {createTechnician.isPending ? 'Salvando...' : 'Salvar Técnico'}
        </Button>
      </div>
    </form>
  );
};

export default NewTechnicianForm;
