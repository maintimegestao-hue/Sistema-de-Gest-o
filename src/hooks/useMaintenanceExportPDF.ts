
import { useCallback } from 'react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export const useMaintenanceExportPDF = () => {
  const exportMaintenanceToPDF = useCallback((maintenanceOrder: any) => {
    try {
      const doc = new jsPDF();
      const pageWidth = 210;
      const margin = 15;
      let currentY = margin;

      // Cabeçalho
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(76, 175, 80);
      doc.text('ORDEM DE SERVIÇO - MANUTENÇÃO', margin, currentY);
      currentY += 15;

      // Informações básicas
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      doc.text(`O.S. Nº: ${maintenanceOrder.id.slice(-8)}`, margin, currentY);
      doc.text(`Data: ${new Date(maintenanceOrder.created_at).toLocaleDateString('pt-BR')}`, pageWidth - margin - 40, currentY);
      currentY += 10;

      doc.text(`Status: ${maintenanceOrder.status}`, margin, currentY);
      doc.text(`Prioridade: ${maintenanceOrder.priority}`, margin + 60, currentY);
      currentY += 10;

      doc.text(`Tipo: ${maintenanceOrder.maintenance_type}`, margin, currentY);
      currentY += 15;

      // Equipamento
      doc.setFont('helvetica', 'bold');
      doc.text('EQUIPAMENTO:', margin, currentY);
      currentY += 8;
      doc.setFont('helvetica', 'normal');
      doc.text(`Nome: ${maintenanceOrder.equipments?.name || 'N/A'}`, margin, currentY);
      currentY += 6;
      doc.text(`Local: ${maintenanceOrder.equipments?.installation_location || 'N/A'}`, margin, currentY);
      currentY += 15;

      // Descrição
      doc.setFont('helvetica', 'bold');
      doc.text('DESCRIÇÃO DO SERVIÇO:', margin, currentY);
      currentY += 8;
      doc.setFont('helvetica', 'normal');
      const splitDescription = doc.splitTextToSize(maintenanceOrder.description || '', pageWidth - (margin * 2));
      doc.text(splitDescription, margin, currentY);
      currentY += splitDescription.length * 6 + 10;

      // Técnico
      if (maintenanceOrder.technicians?.name) {
        doc.setFont('helvetica', 'bold');
        doc.text('TÉCNICO RESPONSÁVEL:', margin, currentY);
        currentY += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(`Nome: ${maintenanceOrder.technicians.name}`, margin, currentY);
        currentY += 15;
      }

      // Datas
      doc.setFont('helvetica', 'bold');
      doc.text('DATAS:', margin, currentY);
      currentY += 8;
      doc.setFont('helvetica', 'normal');
      doc.text(`Criação: ${new Date(maintenanceOrder.created_at).toLocaleDateString('pt-BR')}`, margin, currentY);
      currentY += 6;
      if (maintenanceOrder.scheduled_date) {
        doc.text(`Agendada: ${new Date(maintenanceOrder.scheduled_date).toLocaleDateString('pt-BR')}`, margin, currentY);
        currentY += 6;
      }
      doc.text(`Atualização: ${new Date(maintenanceOrder.updated_at).toLocaleDateString('pt-BR')}`, margin, currentY);
      currentY += 20;

      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Documento gerado automaticamente pelo Sistema Evolutec', margin, 280);

      // Salvar
      const fileName = `OS_${maintenanceOrder.id.slice(-8)}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      toast.success('✅ PDF da O.S. exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF da manutenção:', error);
      toast.error('❌ Erro ao gerar PDF da manutenção');
    }
  }, []);

  return { exportMaintenanceToPDF };
};
