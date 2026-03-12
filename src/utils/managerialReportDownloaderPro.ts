import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

export interface ManagerialReportData {
  year: number;
  month?: number | null;
  clientName: string;
  summary: {
    totalMaintenances: number;
    completedMaintenances: number;
    pendingMaintenances: number;
    inProgressMaintenances: number;
    totalEquipments: number;
    avgMtbf: number;
    avgMttr: number;
  };
  maintenanceByType: Array<{ name: string; value: number; color: string }>;
  monthlyData: Array<{ month: string; preventivas: number; corretivas: number; preditivas: number; total: number }>;
  equipmentStats: Array<{ name: string; client: string; totalMaintenances: number; lastMaintenance?: string }>;
  preventiveSchedule: {
    totalScheduled: number;
    completed: number;
    overdue: number;
    pending: number;
  };
}

export const downloadManagerialReportProAsPDF = async (data: ManagerialReportData, customOptions?: any) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Configure encoding
  pdf.setCharSpace(0);
  pdf.setR2L(false);
  
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  let currentY = margin;

  // Cores do design system (baseado no estilo da proposta)
  const colors = {
    primary: [34, 197, 94] as [number, number, number], // Verde
    secondary: [22, 163, 74] as [number, number, number], // Verde escuro
    accent: [255, 152, 0] as [number, number, number], // Laranja
    background: [248, 249, 250] as [number, number, number], // Cinza claro
    text: [33, 33, 33] as [number, number, number], // Cinza escuro
    border: [224, 224, 224] as [number, number, number], // Cinza médio
    white: [255, 255, 255] as [number, number, number],
    darkGray: [48, 48, 48] as [number, number, number]
  };

  // Helper function to add new page if needed
  const checkNewPage = (requiredHeight: number) => {
    if (currentY + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
      return true;
    }
    return false;
  };

  // Helper function to draw modern card
  const drawModernCard = (title: string, content: () => number, bgColor = colors.white) => {
    checkNewPage(60);
    
    // Card shadow effect
    pdf.setFillColor(200, 200, 200);
    pdf.roundedRect(margin + 1, currentY + 1, contentWidth, 50, 3, 3, 'F');
    
    // Card background
    pdf.setFillColor(...bgColor);
    pdf.roundedRect(margin, currentY, contentWidth, 50, 3, 3, 'F');
    
    // Card border
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin, currentY, contentWidth, 50, 3, 3, 'S');
    
    // Header with gradient effect
    pdf.setFillColor(...colors.primary);
    pdf.roundedRect(margin, currentY, contentWidth, 12, 3, 3, 'F');
    pdf.rect(margin, currentY + 9, contentWidth, 3, 'F'); // Complete bottom part of rounded rect
    
    // Title
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.white);
    pdf.text(title, margin + 5, currentY + 8);
    
    // Content area
    const contentY = currentY + 18;
    pdf.setTextColor(...colors.text);
    const contentHeight = content();
    
    currentY += 60;
    return contentHeight;
  };

  // === PÁGINA 1: RESUMO EXECUTIVO ===
  
  // Header principal com gradiente
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, pageWidth, 25, 'F');
  
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.white);
  const titleText = `Relatório Gerencial ${data.year}${data.month ? ` - ${getMonthName(data.month)}` : ''}`;
  pdf.text(titleText, pageWidth / 2, 16, { align: 'center' });
  
  currentY = 35;

  // Cliente
  pdf.setFontSize(14);
  pdf.setTextColor(...colors.text);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Cliente: ${data.clientName}`, margin, currentY);
  currentY += 15;

  // Card: Resumo Geral
  drawModernCard('📊 Resumo Geral', () => {
    const items = [
      [`Total de Manutenções:`, `${data.summary.totalMaintenances}`],
      [`Concluídas:`, `${data.summary.completedMaintenances}`, 'success'],
      [`Pendentes:`, `${data.summary.pendingMaintenances}`, 'warning'],
      [`Em Andamento:`, `${data.summary.inProgressMaintenances}`, 'info'],
      [`Total de Equipamentos:`, `${data.summary.totalEquipments}`]
    ];

    pdf.setFontSize(10);
    let itemY = currentY + 18;

    items.forEach(([label, value, type]) => {
      // Label
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...colors.text);
      pdf.text(label, margin + 10, itemY);
      
      // Value with color coding
      pdf.setFont('helvetica', 'bold');
      if (type === 'success') pdf.setTextColor(34, 197, 94);
      else if (type === 'warning') pdf.setTextColor(245, 158, 11);
      else if (type === 'info') pdf.setTextColor(59, 130, 246);
      else pdf.setTextColor(...colors.primary);
      
      pdf.text(value, margin + 120, itemY);
      itemY += 7;
    });

    return 40;
  });

  // === PÁGINA 2: DISTRIBUIÇÃO POR TIPO ===
  pdf.addPage();
  currentY = margin;

  // Header da página
  pdf.setFillColor(...colors.secondary);
  pdf.rect(0, 0, pageWidth, 20, 'F');
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.white);
  pdf.text('Distribuição por Tipo de Manutenção', pageWidth / 2, 13, { align: 'center' });
  
  currentY = 35;

  drawModernCard('🔧 Manutenções por Tipo', () => {
    let itemY = currentY + 18;
    
    data.maintenanceByType.forEach((type) => {
      // Color indicator
      const hexColor = type.color;
      const rgb = hexToRgb(hexColor);
      pdf.setFillColor(rgb.r, rgb.g, rgb.b);
      pdf.circle(margin + 15, itemY - 2, 3, 'F');
      
      // Label
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(10);
      pdf.text(type.name, margin + 25, itemY);
      
      // Value
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${type.value}`, margin + 120, itemY);
      
      // Percentage
      const percentage = data.summary.totalMaintenances > 0 
        ? ((type.value / data.summary.totalMaintenances) * 100).toFixed(1)
        : '0';
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`(${percentage}%)`, margin + 140, itemY);
      
      itemY += 8;
    });

    return 40;
  });

  // === PÁGINA 3: EVOLUÇÃO MENSAL ===
  pdf.addPage();
  currentY = margin;

  // Header da página
  pdf.setFillColor(...colors.accent);
  pdf.rect(0, 0, pageWidth, 20, 'F');
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.white);
  pdf.text('Evolução Mensal', pageWidth / 2, 13, { align: 'center' });
  
  currentY = 35;

  drawModernCard('📈 Dados Mensais', () => {
    // Table headers
    const headers = ['Mês', 'Preventivas', 'Corretivas', 'Preditivas', 'Total'];
    const colWidths = [35, 35, 35, 35, 35];
    
    let tableY = currentY + 18;
    
    // Header row
    pdf.setFillColor(...colors.background);
    pdf.rect(margin + 5, tableY, 175, 8, 'F');
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(...colors.text);
    
    let xPos = margin + 10;
    headers.forEach((header, i) => {
      pdf.text(header, xPos, tableY + 5);
      xPos += colWidths[i];
    });
    
    tableY += 10;
    
    // Data rows
    pdf.setFont('helvetica', 'normal');
    data.monthlyData.slice(0, 6).forEach((row, index) => {
      if (index % 2 === 1) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin + 5, tableY, 175, 7, 'F');
      }
      
      const values = [row.month, row.preventivas, row.corretivas, row.preditivas, row.total];
      xPos = margin + 10;
      
      values.forEach((value, i) => {
        pdf.setTextColor(...colors.text);
        pdf.text(String(value), xPos, tableY + 5);
        xPos += colWidths[i];
      });
      
      tableY += 7;
    });

    return 80;
  });

  // === PÁGINA 4: EQUIPAMENTOS ===
  pdf.addPage();
  currentY = margin;

  // Header da página
  pdf.setFillColor(59, 130, 246); // Azul
  pdf.rect(0, 0, pageWidth, 20, 'F');
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.white);
  pdf.text('Top 5 Equipamentos', pageWidth / 2, 13, { align: 'center' });
  
  currentY = 35;

  drawModernCard('⚙️ Equipamentos com Mais Manutenções', () => {
    let itemY = currentY + 18;
    
    data.equipmentStats.slice(0, 5).forEach((equipment, index) => {
      // Ranking number
      pdf.setFillColor(...colors.primary);
      pdf.circle(margin + 12, itemY - 1, 4, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(...colors.white);
      pdf.text(String(index + 1), margin + 10, itemY + 1);
      
      // Equipment name
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...colors.text);
      pdf.text(equipment.name, margin + 25, itemY);
      
      // Maintenance count
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...colors.primary);
      pdf.text(`${equipment.totalMaintenances} manutenções`, margin + 120, itemY);
      
      itemY += 8;
    });

    return 45;
  });

  // === PÁGINA 5: CRONOGRAMA PREVENTIVO ===
  pdf.addPage();
  currentY = margin;

  // Header da página
  pdf.setFillColor(168, 85, 247); // Roxo
  pdf.rect(0, 0, pageWidth, 20, 'F');
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.white);
  pdf.text('Cronograma Preventivo', pageWidth / 2, 13, { align: 'center' });
  
  currentY = 35;

  drawModernCard('📅 Status do Cronograma', () => {
    const scheduleItems = [
      [`Total Programadas:`, `${data.preventiveSchedule.totalScheduled}`],
      [`Concluídas:`, `${data.preventiveSchedule.completed}`, 'success'],
      [`Em Atraso:`, `${data.preventiveSchedule.overdue}`, 'error'],
      [`Pendentes:`, `${data.preventiveSchedule.pending}`, 'warning']
    ];

    pdf.setFontSize(10);
    let itemY = currentY + 18;

    scheduleItems.forEach(([label, value, type]) => {
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...colors.text);
      pdf.text(label, margin + 10, itemY);
      
      pdf.setFont('helvetica', 'bold');
      if (type === 'success') pdf.setTextColor(34, 197, 94);
      else if (type === 'error') pdf.setTextColor(239, 68, 68);
      else if (type === 'warning') pdf.setTextColor(245, 158, 11);
      else pdf.setTextColor(...colors.primary);
      
      pdf.text(value, margin + 120, itemY);
      
      // Progress bar
      const total = data.preventiveSchedule.totalScheduled;
      if (total > 0 && type) {
        const percentage = (parseInt(value) / total);
        const barWidth = 60;
        const barX = margin + 140;
        
        // Background bar
        pdf.setFillColor(240, 240, 240);
        pdf.rect(barX, itemY - 3, barWidth, 4, 'F');
        
        // Progress bar
        if (type === 'success') pdf.setFillColor(34, 197, 94);
        else if (type === 'error') pdf.setFillColor(239, 68, 68);
        else if (type === 'warning') pdf.setFillColor(245, 158, 11);
        
        pdf.rect(barX, itemY - 3, barWidth * percentage, 4, 'F');
      }
      
      itemY += 12;
    });

    return 50;
  });

  // Footer em todas as páginas
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Footer line
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.5);
    pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    
    // Footer text
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Relatório Gerencial - ${data.clientName}`, margin, pageHeight - 12);
    pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
    pdf.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
  }

  // Save the PDF
  const fileName = `relatorio_gerencial_${data.clientName.replace(/\s+/g, '_')}_${data.year}${data.month ? `_${String(data.month).padStart(2, '0')}` : ''}.pdf`;
  pdf.save(fileName);
};

// Helper functions
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 34, g: 197, b: 94 };
};

const getMonthName = (month: number): string => {
  const months = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month] || '';
};