
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useUpdateSupplier, Supplier } from '@/hooks/useSuppliers';

const supplierSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().optional(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  supply_types: z.array(z.string()).min(1, 'Selecione pelo menos um tipo de fornecimento'),
  notes: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface EditSupplierFormProps {
  supplier: Supplier;
  onSuccess: () => void;
}

export const EditSupplierForm: React.FC<EditSupplierFormProps> = ({ supplier, onSuccess }) => {
  const updateSupplier = useUpdateSupplier();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier.name,
      cnpj: supplier.cnpj || '',
      contact_person: supplier.contact_person || '',
      contact_phone: supplier.contact_phone || '',
      contact_email: supplier.contact_email || '',
      address: supplier.address || '',
      neighborhood: supplier.neighborhood || '',
      city: supplier.city || '',
      state: supplier.state || '',
      zip_code: supplier.zip_code || '',
      supply_types: supplier.supply_types,
      notes: supplier.notes || '',
    }
  });

  const supplyTypes = watch('supply_types');

  const onSubmit = (data: SupplierFormData) => {
    updateSupplier.mutate({
      id: supplier.id,
      ...data,
    }, {
      onSuccess,
    });
  };

  const handleSupplyTypeChange = (type: string, checked: boolean) => {
    const currentTypes = supplyTypes || [];
    if (checked) {
      setValue('supply_types', [...currentTypes, type]);
    } else {
      setValue('supply_types', currentTypes.filter(t => t !== type));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="name">Nome da Empresa *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Ex: ABC Materiais Ltda"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

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

        <div>
          <Label htmlFor="contact_phone">Telefone</Label>
          <Input
            id="contact_phone"
            {...register('contact_phone')}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <Label htmlFor="contact_email">E-mail</Label>
          <Input
            id="contact_email"
            type="email"
            {...register('contact_email')}
            placeholder="contato@empresa.com"
          />
          {errors.contact_email && <p className="text-red-500 text-sm mt-1">{errors.contact_email.message}</p>}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            {...register('address')}
            placeholder="Rua, número"
          />
        </div>

        <div>
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input
            id="neighborhood"
            {...register('neighborhood')}
            placeholder="Nome do bairro"
          />
        </div>

        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="Nome da cidade"
          />
        </div>

        <div>
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            {...register('state')}
            placeholder="SP"
          />
        </div>

        <div>
          <Label htmlFor="zip_code">CEP</Label>
          <Input
            id="zip_code"
            {...register('zip_code')}
            placeholder="00000-000"
          />
        </div>
      </div>

      <div>
        <Label>Tipos de Fornecimento *</Label>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="materials"
              checked={supplyTypes?.includes('materials')}
              onCheckedChange={(checked) => handleSupplyTypeChange('materials', checked as boolean)}
            />
            <Label htmlFor="materials">Materiais</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="services"
              checked={supplyTypes?.includes('services')}
              onCheckedChange={(checked) => handleSupplyTypeChange('services', checked as boolean)}
            />
            <Label htmlFor="services">Serviços</Label>
          </div>
        </div>
        {errors.supply_types && <p className="text-red-500 text-sm mt-1">{errors.supply_types.message}</p>}
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

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
};
