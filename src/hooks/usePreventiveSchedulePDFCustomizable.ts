import { useCallback } from 'react';
import { PreventiveScheduleItem } from '@/hooks/usePreventiveSchedule';
import { toast } from 'sonner';
import { PDFCustomizationOptions } from '@/components/pdf/PDFCustomizationModal';

export const usePreventiveSchedulePDFCustomizable = () => {
  const exportToPDF = useCallback(async (
    data: PreventiveScheduleItem[] | undefined, 
    year: number,
    clientName: string,
    options?: PDFCustomizationOptions,
    preview = false
  ) => {
    try {
      if (!data || data.length === 0) {
        toast.error('❌ Nenhum dado disponível para exportar');
        return;
      }

      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape para melhor visualização

      // Configurações de cores
      const headerBgColor = options?.headerBackgroundColor || '#22C55E';
      const headerTextColor = options?.headerTextColor || '#FFFFFF';
      const titleBgColor = options?.titleBackgroundColor || '#16A34A';
      const fontSize = options?.fontSize || 10;
      const fontFamily = options?.fontFamily || 'helvetica';

      // Header com logo e cores personalizadas
      const headerHeight = 25;
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 34, g: 197, b: 94 };
      };

      const headerRgb = hexToRgb(headerBgColor);
      doc.setFillColor(headerRgb.r, headerRgb.g, headerRgb.b);
      doc.rect(0, 0, 297, headerHeight, 'F');

      // Título
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont(fontFamily, 'bold');
      doc.text('CRONOGRAMA DE MANUTENÇÃO PREVENTIVA ANUAL', 148.5, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`${year} - ${clientName}`, 148.5, 22, { align: 'center' });

      // Preparar dados da tabela com lógica de periodicidade avançada
      const equipmentGroups = groupEquipmentsByPeriodicityLogic(data);
      
      if (Object.keys(equipmentGroups).length === 0) {
        toast.error('❌ Nenhum equipamento encontrado para exportar');
        return;
      }

      const { tableData, cellColors } = prepareAdvancedTableData(equipmentGroups);

      // Configurar cabeçalho da tabela
      const headers = [
        'TAG', 'FAMÍLIA', 'ANO', 'LOCAL/MÁQUINA', 'PRIORIZA', 
        'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 
        'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
      ];

      // Gerar tabela com autoTable
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: headerHeight + 10,
        styles: {
          fontSize: fontSize,
          fontStyle: 'normal',
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [headerRgb.r, headerRgb.g, headerRgb.b],
          textColor: [255, 255, 255],
          fontSize: fontSize,
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' }, // TAG
          1: { cellWidth: 25, halign: 'center' }, // FAMÍLIA
          2: { cellWidth: 15, halign: 'center' }, // ANO
          3: { cellWidth: 45, halign: 'left' },   // LOCAL/MÁQUINA
          4: { cellWidth: 20, halign: 'center' }, // PRIORIZA
          // Meses - cada um com largura igual
          5: { cellWidth: 15, halign: 'center' },
          6: { cellWidth: 15, halign: 'center' },
          7: { cellWidth: 15, halign: 'center' },
          8: { cellWidth: 15, halign: 'center' },
          9: { cellWidth: 15, halign: 'center' },
          10: { cellWidth: 15, halign: 'center' },
          11: { cellWidth: 15, halign: 'center' },
          12: { cellWidth: 15, halign: 'center' },
          13: { cellWidth: 15, halign: 'center' },
          14: { cellWidth: 15, halign: 'center' },
          15: { cellWidth: 15, halign: 'center' },
          16: { cellWidth: 15, halign: 'center' },
        },
        didParseCell: function(data) {
          // Aplicar cores das células baseado no status e tipo de manutenção
          if (data.row.index >= 0 && data.column.index >= 5) {
            const cellKey = `${data.row.index}-${data.column.index}`;
            if (cellColors[cellKey]) {
              const color = cellColors[cellKey];
              data.cell.styles.fillColor = [color[0], color[1], color[2]] as [number, number, number];
            }
          }
        },
        margin: { left: 10, right: 10 },
        tableWidth: 'wrap'
      });

      // Adicionar legenda
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      addLegend(doc, finalY, fontSize, fontFamily);

      if (preview) {
        return doc.output('datauristring');
      }

      // Salvar arquivo
      const fileName = `cronograma-preventivo-${clientName.replace(/\s+/g, '-')}-${year}.pdf`;
      doc.save(fileName);
      
      toast.success('✅ PDF do cronograma exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF do cronograma:', error);
      toast.error('❌ Erro ao gerar PDF. Tente novamente.');
      throw error;
    }
  }, []);

  return { exportToPDF };
};

// Função para agrupar equipamentos com lógica de periodicidade avançada
const groupEquipmentsByPeriodicityLogic = (data: PreventiveScheduleItem[]) => {
  const equipmentGroups: Record<string, {
    equipment: any;
    schedules: Record<number, { type: string; status: string; }>;
  }> = {};

  data.forEach(item => {
    if (!item.equipment || !['operational', 'active', 'maintenance'].includes(item.equipment.status || '')) {
      return;
    }

    if (!equipmentGroups[item.equipment_id]) {
      equipmentGroups[item.equipment_id] = {
        equipment: item.equipment,
        schedules: {}
      };
    }

    const month = item.month;
    const periodicity = item.equipment.preventive_periodicity || 'monthly';
    
    // Determinar o tipo de manutenção baseado na lógica de periodicidade
    const maintenanceType = determineMaintenanceType(month, periodicity);
    
    equipmentGroups[item.equipment_id].schedules[month] = {
      type: maintenanceType,
      status: item.status || 'scheduled'
    };
  });

  return equipmentGroups;
};

// Função para determinar o tipo de manutenção baseado no mês e periodicidade
const determineMaintenanceType = (month: number, periodicity: string): string => {
  // Lógica baseada no exemplo do usuário:
  // Janeiro, Junho, Dezembro = diferentes tipos dependendo do equipamento
  // Lógica hierárquica: Anual > Semestral > Trimestral > Bimestral > Mensal
  
  const isAnnual = month === 1; // Janeiro sempre anual
  const isSemestral = month === 1 || month === 7; // Janeiro e Julho
  const isQuarterly = month === 1 || month === 4 || month === 7 || month === 10;
  const isBimonthly = month % 2 === 1; // Meses ímpares
  
  // Se é janeiro, pode ser qualquer tipo - priorizar o mais abrangente
  if (month === 1) return 'A'; // Anual tem prioridade
  if (month === 7 && ['semestral', 'quarterly', 'bimonthly', 'monthly'].includes(periodicity)) return 'S';
  if (isQuarterly && ['quarterly', 'bimonthly', 'monthly'].includes(periodicity)) return 'T';
  if (isBimonthly && ['bimonthly', 'monthly'].includes(periodicity)) return 'B';
  if (periodicity === 'monthly') return 'M';
  
  return '';
};

// Função para preparar dados da tabela com cores
const prepareAdvancedTableData = (equipmentGroups: Record<string, any>) => {
  const tableData: string[][] = [];
  const cellColors: Record<string, number[]> = {};
  
  Object.entries(equipmentGroups).forEach(([equipmentId, group], rowIndex) => {
    const equipment = group.equipment;
    const schedules = group.schedules;
    
    // Preparar linha da tabela
    const row = [
      equipment.name?.substring(0, 8) || 'N/A', // TAG (limitado)
      equipment.preventive_periodicity?.substring(0, 3).toUpperCase() || 'MEN', // FAMÍLIA
      new Date().getFullYear().toString(), // ANO
      `${equipment.installation_location || 'N/A'}`, // LOCAL/MÁQUINA
      'A', // PRIORIZA (sempre A por enquanto)
    ];

    // Adicionar meses
    for (let month = 1; month <= 12; month++) {
      const schedule = schedules[month];
      if (schedule && schedule.type) {
        row.push(schedule.type);
        
        // Definir cor baseada no status
        const cellKey = `${rowIndex}-${month + 4}`; // +4 porque são 5 colunas antes dos meses
        cellColors[cellKey] = getStatusColor(schedule.status, schedule.type);
      } else {
        row.push('');
      }
    }
    
    tableData.push(row);
  });

  return { tableData, cellColors };
};

// Função para obter cores baseadas no status e tipo
const getStatusColor = (status: string, type: string): number[] => {
  switch (status) {
    case 'completed':
      return [144, 238, 144]; // Verde claro
    case 'overdue':
      return [255, 182, 193]; // Vermelho claro
    case 'pending':
      return [173, 216, 230]; // Azul claro
    default:
      // Cores diferentes para cada tipo de manutenção
      switch (type) {
        case 'A': return [255, 239, 204]; // Amarelo claro para anual
        case 'S': return [204, 229, 255]; // Azul claro para semestral
        case 'T': return [229, 204, 255]; // Roxo claro para trimestral
        case 'B': return [204, 255, 229]; // Verde claro para bimestral
        case 'M': return [248, 249, 250]; // Cinza claro para mensal
        default: return [255, 255, 255]; // Branco
      }
  }
};

// Função para adicionar legenda
const addLegend = (doc: any, startY: number, fontSize: number, fontFamily: string) => {
  doc.setFontSize(fontSize);
  doc.setFont(fontFamily, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('LEGENDA:', 20, startY);
  
  doc.setFont(fontFamily, 'normal');
  const legendItems = [
    'M = Manutenção Mensal',
    'B = Manutenção Bimestral', 
    'T = Manutenção Trimestral',
    'S = Manutenção Semestral',
    'A = Manutenção Anual'
  ];
  
  legendItems.forEach((item, index) => {
    doc.text(item, 20, startY + 10 + (index * 6));
  });

  // Status colors legend
  doc.setFont(fontFamily, 'bold');
  doc.text('STATUS:', 150, startY);
  doc.setFont(fontFamily, 'normal');
  
  const statusItems = [
    'Verde = Executada',
    'Vermelho = Atrasada',
    'Azul = Pendente',
    'Cinza = Agendada'
  ];
  
  statusItems.forEach((item, index) => {
    doc.text(item, 150, startY + 10 + (index * 6));
  });
};