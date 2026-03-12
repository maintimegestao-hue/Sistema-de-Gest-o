
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface TermsFieldsProps {
  register: any;
}

const TermsFields: React.FC<TermsFieldsProps> = ({ register }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-evolutec-black">Termos e Observações</h3>
      
      <div className="space-y-2">
        <Label htmlFor="terms_and_conditions">Termos e Condições</Label>
        <Textarea
          id="terms_and_conditions"
          {...register('terms_and_conditions')}
          placeholder="Termos e condições da proposta..."
          rows={8}
          className="text-sm"
        />
        <p className="text-xs text-gray-500">
          Os termos padrão são preenchidos automaticamente. Você pode editá-los conforme necessário.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Observações adicionais..."
          rows={2}
        />
      </div>
    </div>
  );
};

export default TermsFields;
