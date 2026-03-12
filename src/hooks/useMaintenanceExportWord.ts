
import { useCallback } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

export const useMaintenanceExportWord = () => {
  const exportMaintenanceToWord = useCallback((maintenanceOrder: any) => {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: 'ORDEM DE SERVIÇO - MANUTENÇÃO',
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `O.S. Nº: ${maintenanceOrder.id.slice(-8)}`,
                  bold: true
                }),
                new TextRun({
                  text: `\nData: ${new Date(maintenanceOrder.created_at).toLocaleDateString('pt-BR')}`,
                }),
                new TextRun({
                  text: `\nStatus: ${maintenanceOrder.status}`,
                }),
                new TextRun({
                  text: `\nPrioridade: ${maintenanceOrder.priority}`,
                }),
                new TextRun({
                  text: `\nTipo: ${maintenanceOrder.maintenance_type}`,
                }),
              ]
            }),
            new Paragraph({
              text: 'EQUIPAMENTO',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Nome: ${maintenanceOrder.equipments?.name || 'N/A'}`,
                }),
                new TextRun({
                  text: `\nLocal: ${maintenanceOrder.equipments?.installation_location || 'N/A'}`,
                }),
              ]
            }),
            new Paragraph({
              text: 'DESCRIÇÃO DO SERVIÇO',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: maintenanceOrder.description || 'Nenhuma descrição fornecida',
            }),
            ...(maintenanceOrder.technicians?.name ? [
              new Paragraph({
                text: 'TÉCNICO RESPONSÁVEL',
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                text: `Nome: ${maintenanceOrder.technicians.name}`,
              })
            ] : []),
            new Paragraph({
              text: 'DATAS',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Criação: ${new Date(maintenanceOrder.created_at).toLocaleDateString('pt-BR')}`,
                }),
                ...(maintenanceOrder.scheduled_date ? [
                  new TextRun({
                    text: `\nAgendada: ${new Date(maintenanceOrder.scheduled_date).toLocaleDateString('pt-BR')}`,
                  })
                ] : []),
                new TextRun({
                  text: `\nÚltima Atualização: ${new Date(maintenanceOrder.updated_at).toLocaleDateString('pt-BR')}`,
                }),
              ]
            }),
          ]
        }]
      });

      Packer.toBlob(doc).then(blob => {
        const fileName = `OS_${maintenanceOrder.id.slice(-8)}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.docx`;
        saveAs(blob, fileName);
        toast.success('✅ Arquivo Word da O.S. exportado com sucesso!');
      });
    } catch (error) {
      console.error('Erro ao gerar Word da manutenção:', error);
      toast.error('❌ Erro ao gerar arquivo Word da manutenção');
    }
  }, []);

  return { exportMaintenanceToWord };
};
