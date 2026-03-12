
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateMaterial } from '@/hooks/useMaterials';
import { useSuppliers } from '@/hooks/useSuppliers';
import { toast } from 'sonner';

const materialSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  internal_code: z.string().optional(),
  category: z.string().optional(),
  unit_of_measure: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  technical_description: z.string().optional(),
  unit_price: z.number().min(0, 'Preço deve ser positivo').optional(),
  stock_quantity: z.number().min(0, 'Quantidade deve ser positiva').optional(),
  physical_location: z.string().optional(),
  supplier_id: z.string().optional(),
});

type MaterialFormData = z.infer<typeof materialSchema>;

interface NewMaterialFormProps {
  onSuccess: () => void;
}

export const NewMaterialForm = ({ onSuccess }: NewMaterialFormProps) => {
  const { data: suppliers, isLoading: loadingSuppliers } = useSuppliers();
  const createMaterial = useCreateMaterial();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
  });

  const onSubmit = async (data: MaterialFormData) => {
    try {
      await createMaterial.mutateAsync({
        name: data.name,
        internal_code: data.internal_code || undefined,
        category: data.category || undefined,
        unit_of_measure: data.unit_of_measure || undefined,
        brand: data.brand || undefined,
        model: data.model || undefined,
        technical_description: data.technical_description || undefined,
        unit_price: data.unit_price || undefined,
        stock_quantity: data.stock_quantity || undefined,
        physical_location: data.physical_location || undefined,
        supplier_id: data.supplier_id === 'none' ? undefined : data.supplier_id,
      });
      onSuccess();
    } catch (error) {
      toast.error('Erro ao criar material');
    }
  };

  if (loadingSuppliers) {
    return <div>Carregando...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Material *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Ex: Cabo flexível 2.5mm"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="internal_code">Código Interno</Label>
          <Input
            id="internal_code"
            {...register('internal_code')}
            placeholder="Ex: CAB001"
          />
        </div>
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            {...register('category')}
            placeholder="Ex: Elétrico"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="brand">Marca</Label>
          <Input
            id="brand"
            {...register('brand')}
            placeholder="Ex: Prysmian"
          />
        </div>
        <div>
          <Label htmlFor="model">Modelo</Label>
          <Input
            id="model"
            {...register('model')}
            placeholder="Ex: Flexicom"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="unit_of_measure">Unidade</Label>
          <Input
            id="unit_of_measure"
            {...register('unit_of_measure')}
            placeholder="Ex: metro, peça"
          />
        </div>
        <div>
          <Label htmlFor="unit_price">Preço Unitário (R$)</Label>
          <Input
            id="unit_price"
            type="number"
            step="0.01"
            {...register('unit_price', { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label htmlFor="stock_quantity">Quantidade em Estoque</Label>
          <Input
            id="stock_quantity"
            type="number"
            {...register('stock_quantity', { valueAsNumber: true })}
            placeholder="0"
          />
        </div>
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
            {suppliers?.filter(s => s.supply_types?.includes('materials')).map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="physical_location">Localização Física</Label>
        <Input
          id="physical_location"
          {...register('physical_location')}
          placeholder="Ex: Almoxarifado A - Prateleira 3"
        />
      </div>

      <div>
        <Label htmlFor="technical_description">Descrição Técnica</Label>
        <Textarea
          id="technical_description"
          {...register('technical_description')}
          placeholder="Descrição detalhada do material..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando...' : 'Criar Material'}
        </Button>
      </div>
    </form>
  );
};
