
import { useCallback } from 'react';
import { PreventiveScheduleItem } from '@/hooks/usePreventiveSchedule';
import { toast } from 'sonner';
import { createPDFDocument, addPDFHeader, addPDFLegend } from '@/utils/pdf/pdfUtils';
import { groupSchedulesByEquipment, prepareTableData } from '@/utils/pdf/scheduleDataProcessor';
import { generatePDFTable } from '@/utils/pdf/tableGenerator';

export const usePreventiveSchedulePDF = () => {
  const exportToPDF = useCallback((
    data: PreventiveScheduleItem[] | undefined, 
    year: number,
    filters: {
      client: string;
      location: string;
      periodicity: string;
      status: string;
    }
  ) => {
    try {
      if (!data || data.length === 0) {
        toast.error('❌ Nenhum dado disponível para exportar');
        return;
      }

      // Filtrar apenas equipamentos ativos antes de processar
      const activeEquipmentData = data.filter(
        item => item.equipment?.status === 'operational' || item.equipment?.status === 'active'
      );

      if (activeEquipmentData.length === 0) {
        toast.error('❌ Nenhum equipamento ativo encontrado para exportar');
        return;
      }

      const doc = createPDFDocument();
      
      // Adicionar cabeçalho e obter posição Y inicial da tabela
      const startY = addPDFHeader(doc, year, filters);

      // Agrupar dados por equipamento (já filtrados por equipamentos ativos)
      const equipmentGroups = groupSchedulesByEquipment(activeEquipmentData);

      if (Object.keys(equipmentGroups).length === 0) {
        toast.error('❌ Nenhum equipamento ativo encontrado após aplicar filtros');
        return;
      }

      // Preparar dados da tabela
      const { tableRows, cellStyles } = prepareTableData(equipmentGroups);

      if (tableRows.length === 0) {
        toast.error('❌ Nenhum dado válido para gerar o PDF');
        return;
      }

      // Gerar tabela
      generatePDFTable(doc, tableRows, cellStyles, startY);

      // Adicionar legenda
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      addPDFLegend(doc, finalY);

      // Salvar o arquivo
      const fileName = `cronograma-preventivo-${year}.pdf`;
      doc.save(fileName);
      
      toast.success('✅ PDF do cronograma exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF do cronograma:', error);
      toast.error('❌ Não foi possível gerar o PDF do cronograma. Tente novamente mais tarde.');
    }
  }, []);

  return { exportToPDF };
};
