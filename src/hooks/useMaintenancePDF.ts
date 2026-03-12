import { useCallback } from 'react';
import { toast } from 'sonner';

interface PDFCustomizationOptions {
  headerBackgroundColor?: string;
  titleBackgroundColor?: string;
  fontFamily?: string;
  fontSize?: number;
}

interface MaintenanceOrder {
  id: string;
  order_number?: string;
  description: string;
  maintenance_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  scheduled_date?: string;
  equipments?: {
    name: string;
    installation_location?: string;
  };
  technicians?: {
    name: string;
  };
  execution?: {
    observations?: string;
    technician_signature?: string;
    digital_signature?: string;
    checklist_items?: any[];
    start_datetime?: string;
    end_datetime?: string;
  };
}

export const useMaintenancePDF = () => {
  const exportToPDF = useCallback(async (
    maintenanceOrder: MaintenanceOrder,
    customOptions?: PDFCustomizationOptions,
    preview = false
  ) => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();

      // Configurações padrão ou customizadas
      const options = customOptions || {};
      const headerColor = options.headerBackgroundColor || '#22C55E';
      const titleColor = options.titleBackgroundColor || '#16A34A';
      const fontFamily = options.fontFamily || 'helvetica';
      const fontSize = options.fontSize || 12;

      // Configurar fonte
      doc.setFont(fontFamily);

      // Header com cor personalizada
      doc.setFillColor(headerColor);
      doc.rect(0, 0, 210, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text('Relatório de Manutenção', 105, 20, { align: 'center' });

      // Informações da ordem
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(fontSize);
      
      let yPos = 50;
      const lineHeight = 8;

      // Título personalizado
      if (options.titleBackgroundColor) {
        doc.setFillColor(titleColor);
        doc.rect(20, yPos - 5, 170, 12, 'F');
        doc.setTextColor(255, 255, 255);
      }
      
      doc.setFontSize(fontSize + 2);
      doc.text(`Ordem: ${maintenanceOrder.order_number || 'N/A'}`, 25, yPos);
      yPos += lineHeight * 2;

      // Resetar cor do texto
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(fontSize);

      // Informações básicas
      doc.text(`Equipamento: ${maintenanceOrder.equipments?.name || 'N/A'}`, 20, yPos);
      yPos += lineHeight;

      doc.text(`Local: ${maintenanceOrder.equipments?.installation_location || 'N/A'}`, 20, yPos);
      yPos += lineHeight;

      doc.text(`Tipo: ${getMaintenanceTypeLabel(maintenanceOrder.maintenance_type)}`, 20, yPos);
      yPos += lineHeight;

      doc.text(`Status: ${getStatusLabel(maintenanceOrder.status)}`, 20, yPos);
      yPos += lineHeight;

      doc.text(`Data: ${new Date(maintenanceOrder.created_at).toLocaleDateString('pt-BR')}`, 20, yPos);
      yPos += lineHeight * 2;

      // Descrição
      doc.text('Descrição:', 20, yPos);
      yPos += lineHeight;
      const descriptionLines = doc.splitTextToSize(maintenanceOrder.description || '', 170);
      doc.text(descriptionLines, 20, yPos);
      yPos += descriptionLines.length * lineHeight + lineHeight;

      // Observações da execução
      if (maintenanceOrder.execution?.observations) {
        doc.text('Observações:', 20, yPos);
        yPos += lineHeight;
        const observationLines = doc.splitTextToSize(maintenanceOrder.execution.observations, 170);
        doc.text(observationLines, 20, yPos);
        yPos += observationLines.length * lineHeight + lineHeight;
      }

      // Checklist
      if (maintenanceOrder.execution?.checklist_items && maintenanceOrder.execution.checklist_items.length > 0) {
        doc.text('Checklist Executado:', 20, yPos);
        yPos += lineHeight;
        
        maintenanceOrder.execution.checklist_items.forEach((item: any) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }
          
          const itemText = typeof item === 'string' ? item : item.item || 'Item não especificado';
          const status = typeof item === 'object' && item.status ? ` - ${item.status === 'conforme' ? 'Conforme' : 'Não Conforme'}` : '';
          
          doc.text(`• ${itemText}${status}`, 25, yPos);
          yPos += lineHeight;
          
          if (typeof item === 'object' && item.comment) {
            doc.setFontSize(fontSize - 1);
            doc.text(`  Comentário: ${item.comment}`, 30, yPos);
            yPos += lineHeight;
            doc.setFontSize(fontSize);
          }

          // Adicionar informações sobre anexos/imagens
          if (typeof item === 'object' && item.attachments && item.attachments.length > 0) {
            doc.setFontSize(fontSize - 1);
            doc.text(`  Anexos: ${item.attachments.length} imagem(ns) anexada(s)`, 30, yPos);
            yPos += lineHeight;
            
            item.attachments.forEach((attachment: any, index: number) => {
              if (attachment.comment) {
                doc.text(`    - ${attachment.comment}`, 35, yPos);
                yPos += lineHeight;
              } else {
                doc.text(`    - Anexo ${index + 1}`, 35, yPos);
                yPos += lineHeight;
              }
            });
            doc.setFontSize(fontSize);
          }
        });
        yPos += lineHeight;
      }

      // Técnico
      if (maintenanceOrder.technicians?.name || maintenanceOrder.execution?.technician_signature) {
        doc.text(`Técnico: ${maintenanceOrder.technicians?.name || maintenanceOrder.execution?.technician_signature || 'N/A'}`, 20, yPos);
        yPos += lineHeight;
      }

      // Data de execução
      if (maintenanceOrder.execution?.end_datetime) {
        doc.text(`Executado em: ${new Date(maintenanceOrder.execution.end_datetime).toLocaleDateString('pt-BR')}`, 20, yPos);
      }

      if (preview) {
        return doc.output('datauristring');
      }

      // Download do PDF
      const fileName = `manutencao_${maintenanceOrder.order_number || maintenanceOrder.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
      throw error;
    }
  }, []);

  return { exportToPDF };
};

// Helper functions
const getMaintenanceTypeLabel = (type: string) => {
  const labels = {
    'preventive': 'Preventiva',
    'corrective': 'Corretiva',
    'emergency': 'Emergencial'
  };
  return labels[type as keyof typeof labels] || type;
};

const getStatusLabel = (status: string) => {
  const labels = {
    'completed': 'Concluída',
    'in_progress': 'Em Andamento',
    'pending': 'Pendente',
    'cancelled': 'Cancelada'
  };
  return labels[status as keyof typeof labels] || status;
};