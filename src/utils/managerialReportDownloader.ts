
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export interface ManagerialReportFilters {
  year: string;
  month: string;
  startDate: string;
  endDate: string;
}

export const downloadManagerialReportAsPDF = async (filters: ManagerialReportFilters) => {
  try {
    const pdf = new jsPDF();
    
    // Título
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Relatório Gerencial de Manutenção', 20, 30);
    
    // Linha separadora
    pdf.setLineWidth(0.5);
    pdf.line(20, 35, 190, 35);
    
    let yPosition = 50;
    
    // Período
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Período do Relatório:', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Ano: ${filters.year}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Mês: ${filters.month}`, 20, yPosition);
    yPosition += 8;
    
    if (filters.startDate) {
      pdf.text(`Data Início: ${new Date(filters.startDate).toLocaleDateString('pt-BR')}`, 20, yPosition);
      yPosition += 8;
    }
    
    if (filters.endDate) {
      pdf.text(`Data Fim: ${new Date(filters.endDate).toLocaleDateString('pt-BR')}`, 20, yPosition);
      yPosition += 15;
    }
    
    // Resumo das Atividades
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Resumo das Atividades:', 20, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('• Total de Manutenções: 29 (+12% vs mês anterior)', 20, yPosition);
    yPosition += 8;
    pdf.text('• MTBF Médio: 737h (Tempo médio entre falhas)', 20, yPosition);
    yPosition += 8;
    pdf.text('• MTTR Médio: 2.4h (Tempo médio de reparo)', 20, yPosition);
    yPosition += 15;
    
    // Distribuição por Tipo
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Distribuição por Tipo de Manutenção:', 20, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('• Preventivas: 15 executadas / 18 programadas', 20, yPosition);
    yPosition += 8;
    pdf.text('• Corretivas: 8 executadas / 5 programadas', 20, yPosition);
    yPosition += 8;
    pdf.text('• Preditivas: 6 executadas / 8 programadas', 20, yPosition);
    yPosition += 15;
    
    // Mão de Obra
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Mão de Obra:', 20, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('• Horas trabalhadas: 145h', 20, yPosition);
    yPosition += 8;
    pdf.text('• Técnicos envolvidos: 8', 20, yPosition);
    yPosition += 8;
    pdf.text('• Custo total: R$ 12.500,00', 20, yPosition);
    yPosition += 15;
    
    // Pendências
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pendências:', 20, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('• Manutenções pendentes: 3', 20, yPosition);
    yPosition += 8;
    pdf.text('• Peças em falta: 2', 20, yPosition);
    yPosition += 8;
    pdf.text('• Orçamentos aguardando: 1', 20, yPosition);
    
    // Salvar o PDF
    const fileName = `relatorio_gerencial_${filters.year}_${filters.month}.pdf`;
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF gerencial:', error);
    throw new Error('Falha ao gerar arquivo PDF');
  }
};

export const downloadManagerialReportAsWord = async (filters: ManagerialReportFilters) => {
  try {
    const children = [
      // Título
      new Paragraph({
        children: [
          new TextRun({
            text: 'Relatório Gerencial de Manutenção',
            bold: true,
            size: 32,
          }),
        ],
        heading: HeadingLevel.TITLE,
      }),
      
      // Espaço
      new Paragraph({
        children: [new TextRun({ text: "" })],
      }),
      
      // Período
      new Paragraph({
        children: [
          new TextRun({
            text: "Período do Relatório",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
      }),
      
      new Paragraph({
        children: [
          new TextRun({
            text: `Ano: ${filters.year}`,
          }),
        ],
      }),
      
      new Paragraph({
        children: [
          new TextRun({
            text: `Mês: ${filters.month}`,
          }),
        ],
      }),
    ];

    // Adicionar datas se fornecidas
    if (filters.startDate) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Data Início: ${new Date(filters.startDate).toLocaleDateString('pt-BR')}`,
            }),
          ],
        })
      );
    }
    
    if (filters.endDate) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Data Fim: ${new Date(filters.endDate).toLocaleDateString('pt-BR')}`,
            }),
          ],
        })
      );
    }

    // Adicionar conteúdo do relatório
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Resumo das Atividades",
            bold: true,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
      }),
      
      new Paragraph({
        children: [
          new TextRun({
            text: "• Total de Manutenções: 29 (+12% vs mês anterior)",
          }),
        ],
      }),
      
      new Paragraph({
        children: [
          new TextRun({
            text: "• MTBF Médio: 737h (Tempo médio entre falhas)",
          }),
        ],
      }),
      
      new Paragraph({
        children: [
          new TextRun({
            text: "• MTTR Médio: 2.4h (Tempo médio de reparo)",
          }),
        ],
      })
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });
    
    // Gerar e baixar o arquivo
    const buffer = await Packer.toBlob(doc);
    const fileName = `relatorio_gerencial_${filters.year}_${filters.month}.docx`;
    saveAs(buffer, fileName);
    
    return true;
  } catch (error) {
    console.error('Erro ao gerar Word gerencial:', error);
    throw new Error('Falha ao gerar arquivo Word');
  }
};
