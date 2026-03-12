
import React from 'react';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface CostAndDurationFieldsProps {
  control: Control<any>;
}

const CostAndDurationFields: React.FC<CostAndDurationFieldsProps> = ({ control }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField
        control={control}
        name="labor_cost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Custo da Mão de Obra (R$)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="0.00"
                value={field.value}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="estimated_duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Duração Estimada (horas)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="1"
                value={field.value}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="validity_days"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Validade (dias)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="30"
                value={field.value}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default CostAndDurationFields;
