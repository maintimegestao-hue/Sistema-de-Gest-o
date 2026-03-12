
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateSupplier } from '@/hooks/useSuppliers';
import { toast } from 'sonner';

const supplierSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('Email inválido').optional().or(z.literal('')),
  contact_person: z.string().optional(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  supply_types: z.array(z.string()).min(1, 'Selecione pelo menos um tipo'),
  notes: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface NewSupplierFormProps {
  onSuccess: () => void;
}

export const NewSupplierForm = ({ onSuccess }: NewSupplierFormProps) => {
  const createSupplier = useCreateSupplier();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      supply_types: ['materials'],
    },
  });

  const supplyTypes = watch('supply_types') || [];

  const handleSupplyTypeChange = (type: string, checked: boolean) => {
    const currentTypes = supplyTypes;
    if (checked) {
      setValue('supply_types', [...currentTypes, type]);
    } else {
      setValue('supply_types', currentTypes.filter(t => t !== type));
    }
  };

  const onSubmit = async (data: SupplierFormData) => {
    try {
      await createSupplier.mutateAsync({
        name: data.name,
        cnpj: data.cnpj || undefined,
        contact_phone: data.contact_phone || undefined,
        contact_email: data.contact_email || undefined,
        contact_person: data.contact_person || undefined,
        address: data.address || undefined,
        neighborhood: data.neighborhood || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zip_code: data.zip_code || undefined,
        supply_types: data.supply_types,
        notes: data.notes || undefined,
        status: 'active',
      });
      onSuccess();
    } catch (error) {
      toast.error('Erro ao criar fornecedor');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome da Empresa *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Ex: Distribuidora ABC Ltda"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            {...register('cnpj')}
            placeholder="00.000.000/0000-00"
          />
        </div>
        <div>
          <Label htmlFor="contact_person">Pessoa de Contato</Label>
          <Input
            id="contact_person"
            {...register('contact_person')}
            placeholder="Nome do representante"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact_phone">Telefone</Label>
          <Input
            id="contact_phone"
            {...register('contact_phone')}
            placeholder="(11) 99999-9999"
          />
        </div>
        <div>
          <Label htmlFor="contact_email">Email</Label>
          <Input
            id="contact_email"
            type="email"
            {...register('contact_email')}
            placeholder="contato@empresa.com"
          />
          {errors.contact_email && <p className="text-red-500 text-sm">{errors.contact_email.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="address">Endereço</Label>
        <Input
          id="address"
          {...register('address')}
          placeholder="Rua, número"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input
            id="neighborhood"
            {...register('neighborhood')}
            placeholder="Centro"
          />
        </div>
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="São Paulo"
          />
        </div>
        <div>
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            {...register('state')}
            placeholder="SP"
            maxLength={2}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="zip_code">CEP</Label>
        <Input
          id="zip_code"
          {...register('zip_code')}
          placeholder="00000-000"
          className="w-32"
        />
      </div>

      <div>
        <Label>Tipos de Fornecimento *</Label>
        <div className="space-y-2 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="materials"
              checked={supplyTypes.includes('materials')}
              onCheckedChange={(checked) => handleSupplyTypeChange('materials', checked as boolean)}
            />
            <Label htmlFor="materials">Materiais</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="services"
              checked={supplyTypes.includes('services')}
              onCheckedChange={(checked) => handleSupplyTypeChange('services', checked as boolean)}
            />
            <Label htmlFor="services">Serviços</Label>
          </div>
        </div>
        {errors.supply_types && <p className="text-red-500 text-sm">{errors.supply_types.message}</p>}
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Observações internas sobre o fornecedor..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando...' : 'Criar Fornecedor'}
        </Button>
      </div>
    </form>
  );
};
