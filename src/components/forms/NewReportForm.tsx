
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCreateSecureReportByClient } from '@/hooks/useSecureReportsByClient';
import { useSecureEquipments } from '@/hooks/useSecureEquipments';
import { useSecureTechnicians } from '@/hooks/useSecureTechnicians';
import { useSecureClients } from '@/hooks/useSecureClients';
import { useUserProfile } from '@/hooks/useUserProfile';
import ImageUpload from '@/components/ui/image-upload';
import NewEquipmentForm from '@/components/forms/NewEquipmentForm';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useClientContext } from '@/contexts/ClientContext';
import SignatureCanvas from 'react-signature-canvas';

interface NewReportFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

interface FormData {
  title: string;
  description: string;
  equipment_id: string;
  technician_id: string;
  client_id: string;
  report_date: string;
  attachment_url: string;
  company_logo: File | null;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  full_name: string;
  position: string;
  department: string;
  cnpj: string;
  photos: File[];
  technician_signature: string;
  client_signature: string;
}

const NewReportForm: React.FC<NewReportFormProps> = ({ onSuccess, initialData }) => {
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
  const technicianSignatureRef = useRef<SignatureCanvas>(null);
  const clientSignatureRef = useRef<SignatureCanvas>(null);
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      report_date: initialData?.report_date || new Date().toISOString().split('T')[0],
      photos: [],
      title: initialData?.title || '',
      description: initialData?.description || '',
      equipment_id: initialData?.equipment_id || '',
      technician_id: initialData?.technician_id || '',
      attachment_url: initialData?.attachment_url || '',
      company_name: initialData?.company_name || '',
      company_address: initialData?.company_address || '',
      company_phone: initialData?.company_phone || '',
      company_email: initialData?.company_email || '',
      technician_signature: initialData?.technician_signature || '',
      client_signature: initialData?.client_signature || ''
    }
  });
  
  const createReport = useCreateSecureReportByClient();
  const { data: equipments, refetch: refetchEquipments } = useSecureEquipments();
  const { data: technicians } = useSecureTechnicians();
  const { data: clients } = useSecureClients();
  const { data: userProfile } = useUserProfile();
  const { selectedClientId } = useClientContext();
  
  const equipmentId = watch('equipment_id');
  const technicianId = watch('technician_id');
  const clientId = watch('client_id');
  const companyLogo = watch('company_logo');
  const photos = watch('photos') || [];

  // Sincronizar o cliente do formulário com o cliente selecionado no contexto
  React.useEffect(() => {
    if (selectedClientId) {
      setValue('client_id', selectedClientId);
    }
  }, [selectedClientId, setValue]);

  // Preencher automaticamente dados da empresa do perfil do usuário
  React.useEffect(() => {
    if (userProfile && !clientId) {
      console.log('📝 Preenchendo dados da empresa automaticamente:', userProfile);
      setValue('company_name', userProfile.company_name || '');
      setValue('company_address', userProfile.company_address || '');
      setValue('company_phone', userProfile.phone || '');
      setValue('company_email', userProfile.company_email || '');
      setValue('full_name', userProfile.full_name || '');
      setValue('position', userProfile.position || '');
      setValue('department', userProfile.department || '');
      setValue('cnpj', userProfile.cnpj || '');
      
      // Se há logo da empresa no perfil, criar um objeto File virtual
      if (userProfile.company_logo_url && !companyLogo) {
        console.log('🏢 Logo da empresa detectado no perfil:', userProfile.company_logo_url);
        // Para demonstração visual, vamos criar um placeholder
        fetch(userProfile.company_logo_url)
          .then(response => response.blob())
          .then(blob => {
            const file = new File([blob], 'company-logo.png', { type: blob.type });
            setValue('company_logo', file);
            console.log('✅ Logo da empresa carregado automaticamente');
          })
          .catch(error => {
            console.log('⚠️ Não foi possível carregar o logo automaticamente:', error);
          });
      }
    }
  }, [userProfile, setValue, clientId, companyLogo]);

  // Quando um cliente é selecionado, preencher automaticamente os dados do cliente
  React.useEffect(() => {
    if (clientId && clients) {
      const selectedClient = clients.find(client => client.id === clientId);
      if (selectedClient) {
        console.log('👤 Cliente selecionado:', selectedClient);
        // Preencher dados do cliente selecionado (sobrescreve dados da empresa)
        setValue('company_name', selectedClient.name || '');
        setValue('company_address', selectedClient.address || '');
        setValue('company_phone', selectedClient.phone || '');
        setValue('company_email', selectedClient.email || '');
        setValue('cnpj', selectedClient.cnpj || '');
        
        // Limpar dados pessoais quando cliente é selecionado (focar no cliente)
        setValue('full_name', selectedClient.contact_person || '');
        setValue('position', '');
        setValue('department', '');
        
        console.log('✅ Dados do cliente preenchidos automaticamente');
      }
    } else if (!clientId && userProfile) {
      // Se não há cliente selecionado, voltar aos dados da empresa
      console.log('🔄 Voltando aos dados da empresa (cliente desmarcado)');
      setValue('company_name', userProfile.company_name || '');
      setValue('company_address', userProfile.company_address || '');
      setValue('company_phone', userProfile.phone || '');
      setValue('company_email', userProfile.company_email || '');
      setValue('full_name', userProfile.full_name || '');
      setValue('position', userProfile.position || '');
      setValue('department', userProfile.department || '');
      setValue('cnpj', userProfile.cnpj || '');
    }
  }, [clientId, clients, userProfile, setValue]);

  const handleLogoChange = (file: File | null) => {
    setValue('company_logo', file);
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

  const handleEquipmentSuccess = (newEquipment: any) => {
    setIsEquipmentDialogOpen(false);
    setValue('equipment_id', newEquipment.id);
    refetchEquipments();
  };

  const clearTechnicianSignature = () => {
    technicianSignatureRef.current?.clear();
    setValue('technician_signature', '');
  };

  const clearClientSignature = () => {
    clientSignatureRef.current?.clear();
    setValue('client_signature', '');
  };

  const saveTechnicianSignature = () => {
    if (technicianSignatureRef.current) {
      const signatureData = technicianSignatureRef.current.toDataURL();
      setValue('technician_signature', signatureData);
    }
  };

  const saveClientSignature = () => {
    if (clientSignatureRef.current) {
      const signatureData = clientSignatureRef.current.toDataURL();
      setValue('client_signature', signatureData);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      console.log('📋 Dados do formulário antes da validação:', data);
      
      // Validar campos obrigatórios
      if (!data.title?.trim()) {
        toast.error('Título é obrigatório!');
        return;
      }
      
      if (!data.client_id) {
        toast.error('Cliente é obrigatório!');
        return;
      }
      
      // Capturar assinaturas antes do envio
      let technicianSignature = data.technician_signature;
      let clientSignature = data.client_signature;
      
      if (technicianSignatureRef.current && !technicianSignatureRef.current.isEmpty()) {
        technicianSignature = technicianSignatureRef.current.toDataURL();
      }
      
      if (clientSignatureRef.current && !clientSignatureRef.current.isEmpty()) {
        clientSignature = clientSignatureRef.current.toDataURL();
      }

      // Preparar dados para envio (incluindo client_id)
      const reportData = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        equipment_id: data.equipment_id || undefined,
        technician_id: data.technician_id || undefined,
        client_id: data.client_id, // CRÍTICO: incluir client_id
        report_date: data.report_date || new Date().toISOString().split('T')[0],
        attachment_url: data.attachment_url?.trim() || undefined,
        technician_signature: technicianSignature || undefined,
        client_signature: clientSignature || undefined,
        photos: (data.photos && data.photos.length > 0) ? data.photos : undefined,
      };
      
      console.log('📤 Dados preparados para envio:', reportData);
      
      const result = await createReport.mutateAsync(reportData);
      
      console.log('✅ Relatório criado com sucesso:', result);
      
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('❌ Erro ao criar relatório:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Dados da Empresa */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-evolutec-black">Dados da Empresa</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUpload
            label="Logotipo da Empresa"
            value={companyLogo}
            onChange={handleLogoChange}
          />

          <div className="space-y-2">
            <Label htmlFor="company_name">Nome da Empresa *</Label>
            <Input
              id="company_name"
              {...register('company_name', { required: 'Nome da empresa é obrigatório' })}
              placeholder="Nome da sua empresa"
            />
            {errors.company_name && <p className="text-sm text-red-500">{errors.company_name.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_address">Endereço da Empresa</Label>
          <Input
            id="company_address"
            {...register('company_address')}
            placeholder="Endereço completo da empresa"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_phone">Telefone</Label>
            <Input
              id="company_phone"
              {...register('company_phone')}
              placeholder="(11) 99999-9999"
              readOnly={!!clientId}
              className={clientId ? "bg-gray-50" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_email">E-mail</Label>
            <Input
              id="company_email"
              type="email"
              {...register('company_email')}
              placeholder="contato@empresa.com"
              readOnly={!!clientId}
              className={clientId ? "bg-gray-50" : ""}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              {...register('full_name')}
              placeholder="Seu nome completo"
              readOnly={!!clientId}
              className={clientId ? "bg-gray-50" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Cargo</Label>
            <Input
              id="position"
              {...register('position')}
              placeholder="Seu cargo"
              readOnly={!!clientId}
              className={clientId ? "bg-gray-50" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Departamento</Label>
            <Input
              id="department"
              {...register('department')}
              placeholder="Seu departamento"
              readOnly={!!clientId}
              className={clientId ? "bg-gray-50" : ""}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            {...register('cnpj')}
            placeholder="00.000.000/0000-00"
            readOnly={!!clientId}
            className={clientId ? "bg-gray-50" : ""}
          />
        </div>

        {/* Informações adicionais quando um cliente é selecionado */}
        {clientId && clients && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Dados do Cliente Selecionado</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Cidade:</span> {clients.find(c => c.id === clientId)?.city || 'Não informado'}
              </div>
              <div>
                <span className="font-medium">Estado:</span> {clients.find(c => c.id === clientId)?.state || 'Não informado'}
              </div>
              <div>
                <span className="font-medium">CEP:</span> {clients.find(c => c.id === clientId)?.zip_code || 'Não informado'}
              </div>
            </div>
            {clients.find(c => c.id === clientId)?.notes && (
              <div className="mt-2">
                <span className="font-medium">Observações:</span> {clients.find(c => c.id === clientId)?.notes}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="client_id">Cliente *</Label>
        <Select value={clientId} onValueChange={(value) => setValue('client_id', value)} required>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients?.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!clientId && <p className="text-sm text-red-500">Cliente é obrigatório</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Título do Relatório *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Título é obrigatório' })}
          placeholder="Ex: Manutenção Preventiva - Compressor"
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="equipment_id">Equipamento Vinculado</Label>
        <div className="flex space-x-2">
          <Select value={equipmentId} onValueChange={(value) => setValue('equipment_id', value)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Selecione o equipamento (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {equipments?.map((equipment) => (
                <SelectItem key={equipment.id} value={equipment.id}>
                  {equipment.name} - {equipment.installation_location || 'Local não informado'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isEquipmentDialogOpen} onOpenChange={setIsEquipmentDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Equipamento</DialogTitle>
              </DialogHeader>
              <NewEquipmentForm onSuccess={handleEquipmentSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="technician_id">Técnico Responsável</Label>
        <Select value={technicianId} onValueChange={(value) => setValue('technician_id', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o técnico (opcional)" />
          </SelectTrigger>
          <SelectContent>
            {technicians?.map((technician) => (
              <SelectItem key={technician.id} value={technician.id}>
                {technician.name} - {technician.specialization}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="report_date">Data do Relatório</Label>
        <Input
          id="report_date"
          type="date"
          {...register('report_date')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Descreva as atividades realizadas, observações e resultados..."
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="attachment_url">URL do Anexo (Opcional)</Label>
        <Input
          id="attachment_url"
          {...register('attachment_url')}
          placeholder="Ex: https://drive.google.com/file/..."
        />
      </div>

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

      {/* Seção de Assinaturas */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-evolutec-black">Assinaturas</h3>
        
        {/* Assinatura do Técnico */}
        <div className="space-y-4">
          <Label>Assinatura do Técnico</Label>
          <div className="border border-gray-300 rounded-lg">
            <SignatureCanvas
              ref={technicianSignatureRef}
              canvasProps={{
                width: 400,
                height: 150,
                className: 'signature-canvas w-full'
              }}
              onEnd={saveTechnicianSignature}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearTechnicianSignature}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Assinatura
          </Button>
        </div>

        {/* Assinatura do Cliente */}
        <div className="space-y-4">
          <Label>Assinatura do Cliente</Label>
          <div className="border border-gray-300 rounded-lg">
            <SignatureCanvas
              ref={clientSignatureRef}
              canvasProps={{
                width: 400,
                height: 150,
                className: 'signature-canvas w-full'
              }}
              onEnd={saveClientSignature}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearClientSignature}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Assinatura
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="submit"
          disabled={createReport.isPending}
          className="evolutec-btn"
        >
          {createReport.isPending ? (initialData ? 'Atualizando...' : 'Salvando...') : (initialData ? 'Atualizar Relatório' : 'Salvar Relatório')}
        </Button>
      </div>
    </form>
  );
};

export default NewReportForm;
