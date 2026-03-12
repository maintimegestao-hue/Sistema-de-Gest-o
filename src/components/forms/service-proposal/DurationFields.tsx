
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DurationFieldsProps {
  register: any;
}

const DurationFields: React.FC<DurationFieldsProps> = ({ register }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="estimated_duration">Prazo Estimado (dias)</Label>
        <Input
          id="estimated_duration"
          type="number"
          min="1"
          {...register('estimated_duration', { valueAsNumber: true })}
          placeholder="Ex: 5"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="validity_days">Validade da Proposta (dias)</Label>
        <Input
          id="validity_days"
          type="number"
          min="1"
          {...register('validity_days', { valueAsNumber: true })}
          placeholder="30"
        />
      </div>
    </div>
  );
};

export default DurationFields;
