
import React from 'react';
import { Control } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface AdditionalFieldsProps {
  control: Control<any>;
}

const AdditionalFields: React.FC<AdditionalFieldsProps> = ({ control }) => {
  return (
    <>
      <FormField
        control={control}
        name="terms_and_conditions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Termos e Condições</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Condições de pagamento, garantias, responsabilidades..." 
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Observações adicionais..." 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default AdditionalFields;
