import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileText, Mail, Phone, CreditCard, CheckCircle } from 'lucide-react';
import { PipelineItem } from '@/hooks/usePipeline';
import { useCreatePipelineItem, useUpdatePipelineItem, usePipelineStages } from '@/hooks/usePipeline';
import { useClients } from '@/hooks/useClients';
import { useServiceProposals } from '@/hooks/useServiceProposals';

interface PipelineItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: PipelineItem | null;
  isCreating: boolean;
  stageId?: string;
  selectedClientId?: string;
}

const PipelineItemModal = ({
  isOpen,
  onClose,
  item,
  isCreating,
  stageId,
  selectedClientId,
}: PipelineItemModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_id: selectedClientId || '',
    stage_id: stageId || '',
    value: 0,
    service_proposal_id: '',
    stage_data: {} as Record<string, any>,
  });

  const [attachments, setAttachments] = useState<File[]>([]);

  const { data: stages } = usePipelineStages();
  const { data: clients } = useClients();
  const { data: serviceProposals } = useServiceProposals();
  const createPipelineItem = useCreatePipelineItem();
  const updatePipelineItem = useUpdatePipelineItem();

  const currentStage = stages?.find(s => s.id === formData.stage_id);
  const requiredFields = currentStage?.required_fields || [];

  useEffect(() => {
    if (item && !isCreating) {
      setFormData({
        title: item.title,
        description: item.description || '',
        client_id: item.client_id,
        stage_id: item.stage_id,
        value: item.value,
        service_proposal_id: item.service_proposal_id || '',
        stage_data: item.stage_data || {},
      });
    } else if (isCreating) {
      setFormData({
        title: '',
        description: '',
        client_id: selectedClientId || '',
        stage_id: stageId || '',
        value: 0,
        service_proposal_id: '',
        stage_data: {},
      });
    }
  }, [item, isCreating, stageId, selectedClientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCreating) {
      await createPipelineItem.mutateAsync(formData);
    } else if (item) {
      await updatePipelineItem.mutateAsync({
        id: item.id,
        updates: formData,
      });
    }

    onClose();
  };

  const updateStageData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      stage_data: {
        ...prev.stage_data,
        [field]: value,
      },
    }));
  };

  const renderStageSpecificFields = () => {
    if (!currentStage) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Documentos da Etapa: {currentStage.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {requiredFields.map((field) => (
            <div key={field} className="space-y-2">
              <Label className="flex items-center gap-2">
                {getFieldIcon(field)}
                {getFieldLabel(field)}
                <Badge variant="secondary" className="text-xs">Obrigatório</Badge>
              </Label>
              {renderFieldInput(field)}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const getFieldIcon = (field: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      technical_report: <FileText className="h-4 w-4" />,
      service_proposal: <FileText className="h-4 w-4" />,
      email_evidence: <Mail className="h-4 w-4" />,
      message_evidence: <Phone className="h-4 w-4" />,
      purchase_order: <CreditCard className="h-4 w-4" />,
      approval_email: <Mail className="h-4 w-4" />,
      billing_authorization: <FileText className="h-4 w-4" />,
      completion_report: <FileText className="h-4 w-4" />,
      client_signature: <CheckCircle className="h-4 w-4" />,
      all_documents_compiled: <FileText className="h-4 w-4" />,
      invoice_sent_email: <Mail className="h-4 w-4" />,
      payment_confirmation: <CreditCard className="h-4 w-4" />,
    };
    return iconMap[field] || <FileText className="h-4 w-4" />;
  };

  const getFieldLabel = (field: string) => {
    const labelMap: Record<string, string> = {
      technical_report: 'Relatório Técnico',
      service_proposal: 'Proposta de Serviço',
      email_evidence: 'Comprovante de Email',
      message_evidence: 'Comprovante de Mensagem',
      purchase_order: 'Pedido de Compra',
      approval_email: 'Email de Aprovação',
      billing_authorization: 'Autorização de Faturamento',
      completion_report: 'Relatório de Conclusão',
      client_signature: 'Assinatura do Cliente',
      all_documents_compiled: 'Todos os Documentos',
      invoice_sent_email: 'Email de Envio da Nota',
      payment_confirmation: 'Comprovante de Pagamento',
    };
    return labelMap[field] || field;
  };

  const renderFieldInput = (field: string) => {
    const value = formData.stage_data[field] || '';

    if (field.includes('email') || field.includes('message')) {
      return (
        <Textarea
          placeholder={`Insira o ${getFieldLabel(field).toLowerCase()}`}
          value={value}
          onChange={(e) => updateStageData(field, e.target.value)}
          className="min-h-[100px]"
        />
      );
    }

    if (field === 'purchase_order' || field === 'payment_confirmation') {
      return (
        <Input
          type="text"
          placeholder={`Número/código do ${getFieldLabel(field).toLowerCase()}`}
          value={value}
          onChange={(e) => updateStageData(field, e.target.value)}
        />
      );
    }

    return (
      <div className="space-y-2">
        <Input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              updateStageData(field, file.name);
            }
          }}
        />
        {value && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Arquivo: {value}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Novo Item do Funil' : 'Editar Item do Funil'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Valor</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal">Proposta (Opcional)</Label>
              <Select
                value={formData.service_proposal_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, service_proposal_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar proposta" />
                </SelectTrigger>
                <SelectContent>
                  {serviceProposals?.map((proposal) => (
                    <SelectItem key={proposal.id} value={proposal.id}>
                      {proposal.proposal_number} - R$ {proposal.total_cost.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {renderStageSpecificFields()}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createPipelineItem.isPending || updatePipelineItem.isPending}
            >
              {isCreating ? 'Criar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PipelineItemModal;