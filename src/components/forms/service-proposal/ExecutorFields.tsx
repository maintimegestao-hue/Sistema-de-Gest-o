
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ExecutorFieldsProps {
  register: any;
  errors: any;
}

const ExecutorFields: React.FC<ExecutorFieldsProps> = ({ register, errors }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-evolutec-black">Executor da Proposta</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="executor_name">Nome do Executor *</Label>
          <Input
            id="executor_name"
            {...register('executor_name', { required: 'Nome do executor é obrigatório' })}
            placeholder="Nome completo do responsável"
          />
          {errors.executor_name && <p className="text-sm text-red-500">{errors.executor_name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="executor_title">Patente/Cargo</Label>
          <Input
            id="executor_title"
            {...register('executor_title')}
            placeholder="Ex: Técnico Especialista, Engenheiro"
          />
        </div>
      </div>
    </div>
  );
};

export default ExecutorFields;
