
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageUpload from '@/components/ui/image-upload';

interface CompanyFieldsProps {
  register: any;
  errors: any;
  setValue: any;
  watch: any;
  userProfile?: {
    company_logo_url?: string;
    company_name?: string;
    cnpj?: string;
    company_address?: string;
    phone?: string;
    full_name?: string;
  };
}

const CompanyFields: React.FC<CompanyFieldsProps> = ({ register, errors, setValue, watch, userProfile }) => {
  const companyLogo = watch('company_logo');

  // Automatically set company logo from user profile if available
  React.useEffect(() => {
    if (userProfile?.company_logo_url && !companyLogo) {
      setValue('company_logo', userProfile.company_logo_url);
    }
  }, [userProfile?.company_logo_url, setValue, companyLogo]);

  const handleLogoChange = (file: File | null) => {
    setValue('company_logo', file);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">Dados da Empresa</h3>
      
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Logo Section - Left */}
        <div className="flex-shrink-0 lg:w-48">
          <div className="w-32 mx-auto lg:mx-0">
            <ImageUpload
              label="Logotipo da Empresa"
              value={companyLogo}
              onChange={handleLogoChange}
            />
          </div>
          {userProfile?.company_logo_url && (
            <div className="flex items-center justify-center lg:justify-start space-x-2 text-xs text-muted-foreground mt-2">
              <div className="w-4 h-4 rounded border border-border overflow-hidden">
                <img 
                  src={userProfile.company_logo_url} 
                  alt="Logo da empresa" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span>Logo carregado automaticamente</span>
            </div>
          )}
        </div>

        {/* Company Data Section - Right */}
        <div className="flex-1 space-y-4 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nome da Empresa *</Label>
              <Input
                id="company_name"
                {...register('company_name', { required: 'Nome da empresa é obrigatório' })}
                placeholder="Nome da sua empresa"
              />
              {errors.company_name && <p className="text-sm text-red-500">{errors.company_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_cnpj">CNPJ</Label>
              <Input
                id="company_cnpj"
                {...register('company_cnpj')}
                placeholder="00.000.000/0001-00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_address">Endereço da Empresa</Label>
              <Input
                id="company_address"
                {...register('company_address')}
                placeholder="Endereço completo da empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_cep">CEP</Label>
              <Input
                id="company_cep"
                {...register('company_cep')}
                placeholder="00000-000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_phone">Telefone</Label>
              <Input
                id="company_phone"
                {...register('company_phone')}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_email">E-mail</Label>
              <Input
                id="company_email"
                type="email"
                {...register('company_email')}
                placeholder="contato@empresa.com"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyFields;
