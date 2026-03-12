
import jsPDF from 'jspdf';

// Extend jsPDF interface for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof import('jspdf-autotable');
  }
}

export const createPDFDocument = () => {
  return new jsPDF('landscape', 'mm', 'a4');
};

export const addPDFHeader = (
  doc: jsPDF, 
  year: number, 
  filters: { client: string; location: string; periodicity: string; status: string; }
) => {
  // Cabeçalho
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Cronograma Preventivo Anual', 20, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ano: ${year}`, 20, 30);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 37);

  // Filtros aplicados
  if (filters.client || filters.location || filters.periodicity || filters.status) {
    doc.text('Filtros aplicados:', 20, 47);
    let yPos = 54;
    if (filters.client) {
      doc.text(`• Cliente: ${filters.client}`, 25, yPos);
      yPos += 7;
    }
    if (filters.location) {
      doc.text(`• Local: ${filters.location}`, 25, yPos);
      yPos += 7;
    }
    if (filters.periodicity) {
      const periodicityLabels = {
        'monthly': 'Mensal',
        'bimonthly': 'Bimestral', 
        'quarterly': 'Trimestral',
        'semestral': 'Semestral',
        'annual': 'Anual'
      };
      const periodicityName = periodicityLabels[filters.periodicity as keyof typeof periodicityLabels] || filters.periodicity;
      doc.text(`• Periodicidade: ${periodicityName}`, 25, yPos);
      yPos += 7;
    }
    if (filters.status) {
      const statusLabels = {
        'completed': 'Executada',
        'pending': 'Aguardando',
        'overdue': 'Perdida',
        'scheduled': 'Agendada'
      };
      const statusName = statusLabels[filters.status as keyof typeof statusLabels] || filters.status;
      doc.text(`• Status: ${statusName}`, 25, yPos);
      yPos += 7;
    }
  }

  return filters.client || filters.location || filters.periodicity || filters.status ? 85 : 55;
};

export const addPDFLegend = (doc: jsPDF, finalY: number) => {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('LEGENDA:', 20, finalY);
  
  // Criar quadrados coloridos para a legenda
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Verde - Executada
  doc.setFillColor(144, 238, 144);
  doc.rect(20, finalY + 5, 4, 4, 'F');
  doc.text('Verde: Executada', 26, finalY + 8);
  
  // Azul - Aguardando
  doc.setFillColor(173, 216, 230);
  doc.rect(20, finalY + 12, 4, 4, 'F');
  doc.text('Azul: Aguardando', 26, finalY + 15);
  
  // Vermelho - Perdida
  doc.setFillColor(255, 182, 193);
  doc.rect(20, finalY + 19, 4, 4, 'F');
  doc.text('Vermelho: Perdida', 26, finalY + 22);
  
  // Cinza - Agendada
  doc.setFillColor(245, 245, 245);
  doc.rect(20, finalY + 26, 4, 4, 'F');
  doc.text('Cinza: Agendada', 26, finalY + 29);
  
  // Periodicidades
  doc.setFont('helvetica', 'bold');
  doc.text('PERIODICIDADES:', 120, finalY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text('M = Mensal (12 meses)', 120, finalY + 15);
  doc.text('B = Bimestral (6 períodos)', 120, finalY + 22);
  doc.text('T = Trimestral (Jan, Abr, Jul, Out)', 120, finalY + 29);
  doc.text('S = Semestral (Jan, Jul)', 120, finalY + 36);
  doc.text('A = Anual (Janeiro)', 120, finalY + 43);
  
  // Observações importantes
  doc.setFont('helvetica', 'bold');
  doc.text('OBSERVAÇÕES:', 20, finalY + 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('• Apenas equipamentos ativos são exibidos no cronograma', 20, finalY + 47);
  doc.text('• As células são preenchidas conforme a periodicidade configurada de cada equipamento', 20, finalY + 53);
  doc.text('• Manutenções executadas fora da janela não alteram o cronograma original', 20, finalY + 59);
};
