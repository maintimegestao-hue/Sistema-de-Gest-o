import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SignatureCanvas from 'react-signature-canvas';
import CompanyFields from './service-proposal/CompanyFields';
import BasicInfoFields from './service-proposal/BasicInfoFields';
import ExecutorFields from './service-proposal/ExecutorFields';
import ScopeFields from './service-proposal/ScopeFields';
import CostAndPaymentFields from './service-proposal/CostAndPaymentFields';
import DurationFields from './service-proposal/DurationFields';
import TermsFields from './service-proposal/TermsFields';
import MaterialsAndServicesSection from './service-proposal/MaterialsAndServicesSection';
import ImageUpload from '@/components/ui/image-upload';
import { useCreateServiceProposal } from '@/hooks/useCreateServiceProposal';
import { useUserProfile } from '@/hooks/useUserProfile';

interface NewServiceProposalFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

interface FormData {
  title: string;
  client_id: string;
  equipment_id: string;
  description: string;
  scope_of_work: string;
  executor_name: string;
  executor_title: string;
  labor_cost: number;
  materials_cost: number;
  payment_method: string;
  discount_percentage: number;
  estimated_duration: number;
  validity_days: number;
  terms_and_conditions: string;
  notes: string;
  company_logo: File | null;
  company_name: string;
  company_cnpj: string;
  company_address: string;
  company_cep: string;
  company_phone: string;
  company_email: string;
  photos: File[];
  selected_materials: Array<{
    material_id: string;
    custom_description?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  selected_services: Array<{
    service_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  technician_signature: string;
  client_signature: string;
}


const DEFAULT_TERMS = `• Para aprovação desta proposta solicitamos enviar nº de pedido ou e-mail de aprovação.
• Solicitamos que seja informado em seu pedido: o número de nossa proposta, CNPJ para faturamento e endereço para envio de Nota Fiscal Eletrônica.
• O orçamento contempla a execução dos serviços durante horário comercial.
• O pagamento à vista do serviço terá um desconto de 5% do valor total da proposta.

Faturamento: A fatura de mão de obra será emitida ao final do mês com o valor proporcional ao serviço realizado. A fatura de equipamentos e materiais será emitida com o valor integral dos equipamentos e materiais ao final do mês de recebimento dos mesmos por parte de V. Sa.

Equipamentos Novos:
• No caso de defeitos de fabricação ou de instalação comprovados através de laudo técnico, comprometemos-nos dentro do prazo de garantia de 3 meses da emissão de nossa nota fiscal, a consertar ou a substituir as peças constatadas como defeituosas e cobertas pelo certificado de garantia fornecida pelo fabricante.
• Excluem-se dessa garantia os defeitos surgidos nos seguintes casos:
• Provocados por falta de manutenção adequada e especializada dos equipamentos, manutenção esta que, caso não venha a ser efetuada pela Evolutec, deverá ser efetuada por empresa credenciada pelo fabricante do equipamento.
• Acidentes oriundos de instalação elétrica não adequada, que tenha sido executada pelo cliente ou por terceiros, principalmente os provenientes da falta de proteção elétrica contra queda de tensão, falta de fase, desequilíbrio de tensão entre fases fora dos limites aceitáveis ou curto-circuito.
• Falhas provocadas pela operação indevida dos equipamentos ou interferência de terceiros na instalação durante o período de garantia.
• Chaves elétricas, fusíveis e correias.
• Excluem-se também da garantia as eventuais despesas de viagens, estadias e refeições de nosso pessoal durante a validade da mesma.

Equipamentos Usados:
• Os mesmos não são cobertos por garantia, mesmo que revisados, já que a condição do equipamento depende da manutenção que o mesmo recebeu durante sua utilização pregressa.

Mão-de-Obra:
• A instalação ou manutenção tem garantia legal de três meses e no caso de manutenção preventiva realizada pela VoltClima extensão de mais três meses.
• A garantia de mão-de-obra limita-se somente aos itens que sofreram intervenção, não se entendendo a todo o sistema existente ou itens atendidos pelo equipamento.
• A garantia não cobre custos de produção.`;

const NewServiceProposalForm: React.FC<NewServiceProposalFormProps> = ({ onSuccess, initialData }) => {
  const { data: userProfile } = useUserProfile();
  const navigate = useNavigate();
  
  const { register, handleSubmit, setValue, watch, reset, control, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      validity_days: initialData?.validity_days || 30,
      labor_cost: initialData?.labor_cost || 0,
      materials_cost: initialData?.materials_cost || 0,
      payment_method: initialData?.payment_method || 'faturado',
      discount_percentage: initialData?.discount_percentage || 0,
      terms_and_conditions: initialData?.terms_and_conditions || DEFAULT_TERMS,
      photos: [],
      selected_materials: [],
      selected_services: [],
      title: initialData?.title || '',
      client_id: initialData?.client_id || '',
      equipment_id: initialData?.equipment_id || '',
      description: initialData?.description || '',
      scope_of_work: initialData?.scope_of_work || '',
      executor_name: initialData?.executor_name || userProfile?.full_name || '',
      executor_title: initialData?.executor_title || userProfile?.position || '',
      estimated_duration: initialData?.estimated_duration || 0,
      notes: initialData?.notes || '',
      company_name: initialData?.company_name || userProfile?.company_name || '',
      company_cnpj: initialData?.company_cnpj || userProfile?.cnpj || '',
      company_address: initialData?.company_address || userProfile?.company_address || '',
      company_cep: initialData?.company_cep || userProfile?.company_cep || '',
      company_phone: initialData?.company_phone || userProfile?.phone || '',
      company_email: initialData?.company_email || userProfile?.company_email || '',
      technician_signature: initialData?.technician_signature || '',
      client_signature: initialData?.client_signature || ''
    }
  });
  
  // Atualizar campos automaticamente quando o perfil do usuário carrega
  React.useEffect(() => {
    if (userProfile && !initialData) {
      setValue('executor_name', userProfile.full_name || '');
      setValue('executor_title', userProfile.position || '');
      setValue('company_name', userProfile.company_name || '');
      setValue('company_cnpj', userProfile.cnpj || '');
      setValue('company_address', userProfile.company_address || '');
      setValue('company_cep', userProfile.company_cep || '');
      setValue('company_phone', userProfile.phone || '');
      setValue('company_email', userProfile.company_email || '');
      
      // Se há logo da empresa, definir como company_logo_url (será usado pelo componente de campos da empresa)
      if (userProfile.company_logo_url) {
        // O logo será carregado automaticamente pelo componente CompanyFields
      }
    }
  }, [userProfile, setValue, initialData]);
  
  const createProposal = useCreateServiceProposal();
  const technicianSignatureRef = useRef<SignatureCanvas>(null);
  const clientSignatureRef = useRef<SignatureCanvas>(null);
  
  const laborCost = watch('labor_cost') || 0;
  const materialsCost = watch('materials_cost') || 0;
  const paymentMethod = watch('payment_method');
  const discountPercentage = watch('discount_percentage') || 0;
  const photos = watch('photos') || [];
  const selectedMaterials = watch('selected_materials') || [];
  const selectedServices = watch('selected_services') || [];
  
  // Calcular custos dos materiais e serviços selecionados
  const calculatedMaterialsCost = selectedMaterials.reduce((total, material) => total + (material.total_price || 0), 0);
  const calculatedServicesCost = selectedServices.reduce((total, service) => total + (service.total_price || 0), 0);
  
  // Atualizar automaticamente os custos baseados nos itens selecionados
  React.useEffect(() => {
    setValue('materials_cost', calculatedMaterialsCost);
  }, [calculatedMaterialsCost, setValue]);

  React.useEffect(() => {
    setValue('labor_cost', calculatedServicesCost);
  }, [calculatedServicesCost, setValue]);
  
  const subtotal = laborCost + materialsCost;
  const discountAmount = (subtotal * discountPercentage) / 100;
  const totalCost = subtotal - discountAmount;

  // Atualizar desconto automaticamente baseado na forma de pagamento
  React.useEffect(() => {
    if (paymentMethod === 'avista') {
      setValue('discount_percentage', 5);
    } else if (paymentMethod === 'faturado') {
      setValue('discount_percentage', 0);
    }
  }, [paymentMethod, setValue]);

  const handlePhotosChange = (newPhotos: File[]) => {
    setValue('photos', newPhotos);
  };

  const addPhoto = (file: File | null) => {
    if (file) {
      const currentPhotos = watch('photos') || [];
      setValue('photos', [...currentPhotos, file]);
    }
  };

  const removePhoto = (index: number) => {
    const currentPhotos = watch('photos') || [];
    const newPhotos = currentPhotos.filter((_, i) => i !== index);
    setValue('photos', newPhotos);
  };

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Dados do formulário antes do envio:', data);
      
      // Verificar se todos os campos obrigatórios estão preenchidos
      if (!data.title) {
        toast.error('Título é obrigatório');
        return;
      }
      
      if (!data.scope_of_work) {
        toast.error('Escopo de trabalho é obrigatório');
        return;
      }

      if (!data.executor_name) {
        toast.error('Nome do executor é obrigatório');
        return;
      }

      if (!data.company_name) {
        toast.error('Nome da empresa é obrigatório');
        return;
      }

      // Capturar assinaturas dos canvases se preenchidas
      let technicianSignature = data.technician_signature;
      if (technicianSignatureRef.current && !technicianSignatureRef.current.isEmpty()) {
        technicianSignature = technicianSignatureRef.current.toDataURL();
      }
      let clientSignature = data.client_signature;
      if (clientSignatureRef.current && !clientSignatureRef.current.isEmpty()) {
        clientSignature = clientSignatureRef.current.toDataURL();
      }

      await createProposal.mutateAsync({
        ...data,
        technician_signature: technicianSignature || null,
        client_signature: clientSignature || null,
      });
      reset();
      if (onSuccess) {
        onSuccess();
      } else {
        toast.success('Proposta Criada Com Sucesso!');
      }
      navigate('/service-proposals');
    } catch (error) {
      console.error('Erro ao criar proposta:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <CompanyFields
        register={register}
        errors={errors}
        setValue={setValue}
        watch={watch}
        userProfile={userProfile}
      />

      <BasicInfoFields
        control={control}
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
      />

      <ExecutorFields
        register={register}
        errors={errors}
      />

      <ScopeFields
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
      />

      {/* Nova seção de Materiais e Serviços */}
      <MaterialsAndServicesSection
        control={control}
        watch={watch}
        setValue={setValue}
      />

      <CostAndPaymentFields
        register={register}
        setValue={setValue}
        watch={watch}
        laborCost={laborCost}
        materialsCost={materialsCost}
        paymentMethod={paymentMethod}
        discountPercentage={discountPercentage}
        subtotal={subtotal}
        discountAmount={discountAmount}
        totalCost={totalCost}
      />

      <DurationFields register={register} />

      <TermsFields register={register} />

      {/* Seção de Fotos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-evolutec-black">Fotos Anexas</h3>
        
        <ImageUpload
          label="Adicionar Foto"
          value={null}
          onChange={addPhoto}
        />

        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-24 object-cover rounded border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 w-6 h-6 p-0"
                  onClick={() => removePhoto(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assinaturas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-evolutec-black">Assinaturas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="mb-2 text-sm font-medium">Assinatura do Técnico</p>
            <div className="border rounded">
              <SignatureCanvas
                ref={technicianSignatureRef}
                canvasProps={{ className: 'w-full h-40' }}
                onEnd={() => setValue('technician_signature', technicianSignatureRef.current?.toDataURL() || '')}
              />
            </div>
            <div className="flex justify-end mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { technicianSignatureRef.current?.clear(); setValue('technician_signature', ''); }}
              >
                Limpar Assinatura
              </Button>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Assinatura do Cliente</p>
            <div className="border rounded">
              <SignatureCanvas
                ref={clientSignatureRef}
                canvasProps={{ className: 'w-full h-40' }}
                onEnd={() => setValue('client_signature', clientSignatureRef.current?.toDataURL() || '')}
              />
            </div>
            <div className="flex justify-end mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { clientSignatureRef.current?.clear(); setValue('client_signature', ''); }}
              >
                Limpar Assinatura
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="submit"
          className="evolutec-btn"
          disabled={createProposal.isPending}
        >
          {createProposal.isPending ? (initialData ? 'Atualizando...' : 'Criando...') : (initialData ? 'Atualizar Proposta' : 'Criar Proposta')}
        </Button>
      </div>
    </form>
  );
};

export default NewServiceProposalForm;
