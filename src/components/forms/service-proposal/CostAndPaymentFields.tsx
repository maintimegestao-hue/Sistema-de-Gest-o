
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CostAndPaymentFieldsProps {
  register: any;
  setValue: any;
  watch: any;
  laborCost: number;
  materialsCost: number;
  paymentMethod: string;
  discountPercentage: number;
  subtotal: number;
  discountAmount: number;
  totalCost: number;
}

const CostAndPaymentFields: React.FC<CostAndPaymentFieldsProps> = ({
  register,
  setValue,
  watch,
  laborCost,
  materialsCost,
  paymentMethod,
  discountPercentage,
  subtotal,
  discountAmount,
  totalCost
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-evolutec-black">Valores e Forma de Pagamento</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="labor_cost">Valor de Mão de Obra (R$)</Label>
          <Input
            id="labor_cost"
            type="number"
            step="0.01"
            min="0"
            {...register('labor_cost', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="materials_cost">Valor de Materiais (R$)</Label>
          <Input
            id="materials_cost"
            type="number"
            step="0.01"
            min="0"
            {...register('materials_cost', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="payment_method">Forma de Pagamento</Label>
          <Select value={paymentMethod} onValueChange={(value) => setValue('payment_method', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="avista">À Vista (5% desconto)</SelectItem>
              <SelectItem value="faturado">Faturado</SelectItem>
              <SelectItem value="parcelado">Parcelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount_percentage">Desconto (%)</Label>
          <Input
            id="discount_percentage"
            type="number"
            step="0.1"
            min="0"
            max="100"
            {...register('discount_percentage', { valueAsNumber: true })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-evolutec-black">Subtotal:</span>
          <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
        </div>
        {discountPercentage > 0 && (
          <div className="flex justify-between items-center text-red-600">
            <span>Desconto ({discountPercentage}%):</span>
            <span>- R$ {discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-center border-t pt-2">
          <span className="font-medium text-evolutec-black">Valor Total:</span>
          <span className="text-xl font-bold text-evolutec-green">
            R$ {totalCost.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CostAndPaymentFields;
