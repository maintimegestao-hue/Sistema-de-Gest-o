
import { useToast } from '@/hooks/use-toast';

interface SubmissionData {
  selectedOrder: string;
  selectedEquipment: string;
  maintenanceType: string;
  technicianSignature: string;
  digitalSignature: string;
  currentChecklist: string[];
  checklist: {[key: string]: boolean};
  periodicity: string;
  observations: string;
  attachments: Array<{file: File, comment: string, type: 'photo' | 'video'}>;
}

export const validateFormSubmission = (data: SubmissionData) => {
  const { toast } = useToast();
  
  // Validação dos campos básicos obrigatórios
  if (!data.selectedEquipment || !data.maintenanceType || !data.technicianSignature) {
    toast({
      title: 'Erro',
      description: 'Por favor, preencha todos os campos obrigatórios: equipamento, tipo de manutenção e técnico responsável.',
      variant: 'destructive',
    });
    return false;
  }

  // Validação da assinatura digital
  if (!data.digitalSignature || data.digitalSignature.trim() === '') {
    toast({
      title: 'Erro',
      description: 'Por favor, registre sua assinatura digital antes de concluir.',
      variant: 'destructive',
    });
    return false;
  }

  // Observações opcionais: se preenchidas, exigir mínimo de 3 caracteres
  const obsLen = data.observations.trim().length;
  if (obsLen > 0 && obsLen < 3) {
    toast({
      title: 'Erro',
      description: 'Observações muito curtas. Se preencher, use pelo menos 3 caracteres.',
      variant: 'destructive',
    });
    return false;
  }

  // Validação do checklist (se há itens, pelo menos um deve estar marcado)
  const checkedItems = data.currentChecklist.filter(item => data.checklist[item]);
  
  if (data.currentChecklist.length > 0 && checkedItems.length === 0) {
    toast({
      title: 'Erro',
      description: 'Por favor, marque pelo menos um item do checklist.',
      variant: 'destructive',
    });
    return false;
  }

  return true;
};

export const buildMaintenanceDescription = (data: SubmissionData) => {
  const checkedItems = data.currentChecklist.filter(item => data.checklist[item]);
  const now = new Date();
  const executionDate = now.toLocaleDateString('pt-BR');
  const executionTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  return `${data.maintenanceType === 'preventive' ? 'Manutenção Preventiva' : 
           data.maintenanceType === 'corrective' ? 'Manutenção Corretiva' : 
           'Manutenção Preditiva'}${data.periodicity ? ` - ${data.periodicity}` : ''}

📅 Executada em: ${executionDate} às ${executionTime}h
👤 Técnico: ${data.technicianSignature}
✍️ Assinado digitalmente

🔧 Itens realizados:
${checkedItems.map(item => `• ${item}`).join('\n')}

📝 Observações: ${data.observations}

🗂️ Anexos: ${data.attachments.length} arquivo(s)`;
};
