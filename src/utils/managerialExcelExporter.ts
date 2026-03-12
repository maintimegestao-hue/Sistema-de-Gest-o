import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ManagerialExcelData {
  year: number;
  month: number | null;
  summary: {
    totalMaintenances: number;
    completedMaintenances: number;
    pendingMaintenances: number;
    inProgressMaintenances: number;
    totalEquipments: number;
    avgMtbf: number;
    avgMttr: number;
  };
  maintenanceByType: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  monthlyData: Array<{
    month: string;
    preventivas: number;
    corretivas: number;
  }>;
  equipmentStats: Array<{
    name: string;
    client: string;
    totalMaintenances: number;
    lastMaintenance: string;
  }>;
}

export const exportManagerialToExcel = async (data: ManagerialExcelData) => {
  try {
    // Criar workbook
    const wb = XLSX.utils.book_new();

    // Aba 1: Resumo Geral
    const summaryData = [
      ['RELATÓRIO GERENCIAL DE MANUTENÇÃO'],
      [''],
      ['Período:', data.month ? `${getMonthName(data.month)}/${data.year}` : `Ano ${data.year}`],
      ['Data de Geração:', new Date().toLocaleDateString('pt-BR')],
      [''],
      ['RESUMO GERAL'],
      ['Total de Manutenções', data.summary.totalMaintenances],
      ['Manutenções Concluídas', data.summary.completedMaintenances],
      ['Manutenções Pendentes', data.summary.pendingMaintenances],
      ['Manutenções em Progresso', data.summary.inProgressMaintenances],
      ['Taxa de Conclusão (%)', ((data.summary.completedMaintenances / data.summary.totalMaintenances) * 100).toFixed(1)],
      [''],
      ['INDICADORES'],
      ['Total de Equipamentos', data.summary.totalEquipments],
      ['MTBF Médio (h)', data.summary.avgMtbf.toFixed(1)],
      ['MTTR Médio (h)', data.summary.avgMttr.toFixed(1)],
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumo');

    // Aba 2: Distribuição por Tipo
    const typeData = [
      ['DISTRIBUIÇÃO POR TIPO DE MANUTENÇÃO'],
      [''],
      ['Tipo', 'Quantidade', 'Percentual (%)']
    ];

    data.maintenanceByType.forEach(item => {
      const total = data.summary.totalMaintenances;
      const percentage = total > 0 ? (item.value / total * 100) : 0;
      typeData.push([item.name, item.value.toString(), percentage.toFixed(1)]);
    });

    const ws2 = XLSX.utils.aoa_to_sheet(typeData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Por Tipo');

    // Aba 3: Evolução Mensal (se não for filtro mensal)
    if (!data.month && data.monthlyData.length > 0) {
      const monthlyData = [
        ['EVOLUÇÃO MENSAL'],
        [''],
        ['Mês', 'Preventivas', 'Corretivas', 'Total']
      ];

      data.monthlyData.forEach(item => {
        const total = item.preventivas + item.corretivas;
        monthlyData.push([item.month, item.preventivas.toString(), item.corretivas.toString(), total.toString()]);
      });

      const ws3 = XLSX.utils.aoa_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Evolução Mensal');
    }

    // Aba 4: Estatísticas de Equipamentos
    if (data.equipmentStats.length > 0) {
      const equipmentData = [
        ['ESTATÍSTICAS DE EQUIPAMENTOS'],
        [''],
        ['Equipamento', 'Cliente', 'Manutenções', 'Última Manutenção']
      ];

      data.equipmentStats.forEach(item => {
        equipmentData.push([
          item.name, 
          item.client,
          item.totalMaintenances.toString(), 
          item.lastMaintenance
        ]);
      });

      const ws4 = XLSX.utils.aoa_to_sheet(equipmentData);
      XLSX.utils.book_append_sheet(wb, ws4, 'Equipamentos');
    }

    // Aplicar estilos básicos
    Object.keys(wb.Sheets).forEach(sheetName => {
      const sheet = wb.Sheets[sheetName];
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
      
      // Definir largura das colunas
      sheet['!cols'] = [
        { width: 30 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 15 }
      ];
    });

    // Gerar arquivo
    const fileName = `relatorio_gerencial_${data.year}${data.month ? `_${data.month.toString().padStart(2, '0')}` : ''}.xlsx`;
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    
    // Converter para Blob e salvar
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    saveAs(blob, fileName);

    return true;
  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
    throw new Error('Falha ao gerar arquivo Excel');
  }
};

// Função auxiliar para converter string para ArrayBuffer
const s2ab = (s: string): ArrayBuffer => {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
};

// Função auxiliar para obter nome do mês
const getMonthName = (month: number): string => {
  const months = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month] || '';
};