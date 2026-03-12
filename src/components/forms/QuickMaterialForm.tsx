import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateMaterial } from '@/hooks/useMaterials';

interface QuickMaterialFormProps {
  onSuccess: (material: any) => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  category: string;
  unit_of_measure: string;
  unit_price: number;
  stock_quantity: number;
  brand?: string;
  model?: string;
  technical_description?: string;
}

const QuickMaterialForm: React.FC<QuickMaterialFormProps> = ({ onSuccess, onCancel }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>();
  const createMaterial = useCreateMaterial();

  const category = watch('category');

  const onSubmit = async (data: FormData) => {
    try {
      const materialData = {
        ...data,
        supplier_id: undefined,
        internal_code: `MAT-${Date.now()}`,
        physical_location: 'Estoque Principal',
        photo_url: undefined,
      };

      const result = await createMaterial.mutateAsync(materialData);
      onSuccess(result);
    } catch (error) {
      console.error('Erro ao criar material:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Material *</Label>
        <Input
          id="name"
          {...register('name', { required: 'Nome é obrigatório' })}
          placeholder="Ex: Parafuso Phillips M6"
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select value={category} onValueChange={(value) => setValue('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixacao">Fixação</SelectItem>
              <SelectItem value="eletrico">Elétrico</SelectItem>
              <SelectItem value="hidraulico">Hidráulico</SelectItem>
              <SelectItem value="mecanico">Mecânico</SelectItem>
              <SelectItem value="consumivel">Consumível</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit_of_measure">Unidade de Medida *</Label>
          <Select onValueChange={(value) => setValue('unit_of_measure', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="peca">Peça</SelectItem>
              <SelectItem value="metro">Metro</SelectItem>
              <SelectItem value="litro">Litro</SelectItem>
              <SelectItem value="kg">Quilograma</SelectItem>
              <SelectItem value="caixa">Caixa</SelectItem>
              <SelectItem value="rolo">Rolo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unit_price">Preço Unitário (R$) *</Label>
          <Input
            id="unit_price"
            type="number"
            step="0.01"
            {...register('unit_price', { 
              required: 'Preço é obrigatório',
              min: { value: 0, message: 'Preço deve ser maior que zero' }
            })}
            placeholder="0,00"
          />
          {errors.unit_price && <p className="text-sm text-red-500">{errors.unit_price.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock_quantity">Quantidade em Estoque *</Label>
          <Input
            id="stock_quantity"
            type="number"
            {...register('stock_quantity', { 
              required: 'Quantidade é obrigatória',
              min: { value: 0, message: 'Quantidade deve ser maior ou igual a zero' }
            })}
            placeholder="0"
          />
          {errors.stock_quantity && <p className="text-sm text-red-500">{errors.stock_quantity.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Marca</Label>
          <Input
            id="brand"
            {...register('brand')}
            placeholder="Ex: Vonder"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Modelo</Label>
          <Input
            id="model"
            {...register('model')}
            placeholder="Ex: VD-123"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="technical_description">Descrição Técnica</Label>
        <Textarea
          id="technical_description"
          {...register('technical_description')}
          placeholder="Descrição detalhada do material..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={createMaterial.isPending}>
          {createMaterial.isPending ? 'Salvando...' : 'Salvar Material'}
        </Button>
      </div>
    </form>
  );
};

export default QuickMaterialForm;