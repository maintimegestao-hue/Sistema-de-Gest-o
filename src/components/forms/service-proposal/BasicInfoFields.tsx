
import React from 'react';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ClientSelector from '../ClientSelector';

interface BasicInfoFieldsProps {
  control: Control<any>;
  register: any;
  setValue: any;
  watch: any;
  errors: any;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ 
  control, 
  register, 
  setValue, 
  watch, 
  errors 
}) => {
  const clientId = watch('client_id');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-evolutec-black">Informações Básicas</h3>
      
      <div className="space-y-2">
        <Label htmlFor="title">Título da Proposta *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Título é obrigatório' })}
          placeholder="Ex: Manutenção Preventiva - Sistema de Ar Condicionado"
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>


      <div className="space-y-2">
        <Label>Cliente *</Label>
        <ClientSelector
          value={clientId}
          onValueChange={(value) => setValue('client_id', value)}
          required
        />
        {errors.client_id && <p className="text-sm text-red-500">Cliente é obrigatório</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Descrição geral da proposta..."
          rows={3}
        />
      </div>
    </div>
  );
};

export default BasicInfoFields;
