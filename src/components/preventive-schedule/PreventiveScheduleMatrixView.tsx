import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PreventiveScheduleItem } from '@/hooks/usePreventiveSchedule';

interface Props {
  scheduleData: PreventiveScheduleItem[];
  year: number;
  clientName: string;
}

const PreventiveScheduleMatrixView: React.FC<Props> = ({ 
  scheduleData, 
  year, 
  clientName 
}) => {
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  
  // Agrupar dados por equipamento
  const equipmentGroups = scheduleData.reduce((acc, item) => {
    const equipmentId = item.equipment_id;
    if (!acc[equipmentId]) {
      acc[equipmentId] = {
        equipment: item.equipment,
        monthlyData: {}
      };
    }
    
    const maintenanceType = determineMaintenanceType(item.month, item.equipment?.preventive_periodicity || 'monthly');
    acc[equipmentId].monthlyData[item.month] = {
      type: maintenanceType,
      status: item.status,
      due_date: item.due_date,
      completed_date: item.completed_date
    };
    
    return acc;
  }, {} as Record<string, any>);

  // Função para determinar o tipo de manutenção
  const determineMaintenanceType = (month: number, periodicity: string): string => {
    const isAnnual = month === 1;
    const isSemestral = month === 1 || month === 7;
    const isQuarterly = month === 1 || month === 4 || month === 7 || month === 10;
    const isBimonthly = month % 2 === 1;
    
    // Hierarquia: Anual > Semestral > Trimestral > Bimestral > Mensal
    if (month === 1) return 'A'; // Janeiro sempre anual
    if (month === 7 && ['semestral', 'quarterly', 'bimonthly', 'monthly'].includes(periodicity)) return 'S';
    if (isQuarterly && ['quarterly', 'bimonthly', 'monthly'].includes(periodicity)) return 'T';
    if (isBimonthly && ['bimonthly', 'monthly'].includes(periodicity)) return 'B';
    if (periodicity === 'monthly') return 'M';
    
    return '';
  };

  // Função para obter cor da célula
  const getCellColor = (monthData: any): string => {
    if (!monthData?.type) return 'bg-gray-50 border-gray-200';
    
    const baseColors = {
      'A': 'bg-yellow-100 border-yellow-300', // Anual
      'S': 'bg-blue-100 border-blue-300',     // Semestral
      'T': 'bg-purple-100 border-purple-300', // Trimestral
      'B': 'bg-green-100 border-green-300',   // Bimestral
      'M': 'bg-gray-100 border-gray-300',     // Mensal
    };

    const statusOverrides = {
      'completed': 'bg-green-200 border-green-400',
      'overdue': 'bg-red-200 border-red-400',
      'pending': 'bg-orange-200 border-orange-400'
    };

    return statusOverrides[monthData.status as keyof typeof statusOverrides] || 
           baseColors[monthData.type as keyof typeof baseColors] || 
           'bg-gray-50 border-gray-200';
  };

  // Função para obter texto da célula
  const getCellText = (monthData: any): string => {
    return monthData?.type || '';
  };

  if (Object.keys(equipmentGroups).length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-gray-500">Nenhum equipamento encontrado para este cliente.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho estilo MASSTIN */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">CRONOGRAMA DE MANUTENÇÃO PREVENTIVA ANUAL</h2>
            <p className="text-blue-100">Cliente: {clientName} | Ano: {year}</p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {Object.keys(equipmentGroups).length} Equipamentos
          </Badge>
        </div>
      </div>

      {/* Tabela em estilo matriz */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              {/* Cabeçalho da tabela */}
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                  <th className="px-4 py-3 text-left font-semibold min-w-[120px] border-r border-white/20">
                    TAG
                  </th>
                  <th className="px-4 py-3 text-left font-semibold min-w-[100px] border-r border-white/20">
                    FAMÍLIA
                  </th>
                  <th className="px-4 py-3 text-center font-semibold w-[60px] border-r border-white/20">
                    ANO
                  </th>
                  <th className="px-4 py-3 text-left font-semibold min-w-[200px] border-r border-white/20">
                    LOCAL/MÁQUINA
                  </th>
                  <th className="px-4 py-3 text-center font-semibold w-[80px] border-r border-white/20">
                    PRIORIZA
                  </th>
                  {months.map((month) => (
                    <th key={month} className="px-2 py-3 text-center font-semibold w-[50px] border-r border-white/20 last:border-r-0">
                      {month}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Corpo da tabela */}
              <tbody>
                {Object.entries(equipmentGroups).map(([equipmentId, group], index) => (
                  <tr key={equipmentId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 border-b border-r font-medium text-sm">
                      {group.equipment?.name?.substring(0, 15) || 'N/A'}
                    </td>
                    <td className="px-4 py-2 border-b border-r text-sm">
                      {getPeriodicityFamily(group.equipment?.preventive_periodicity)}
                    </td>
                    <td className="px-4 py-2 border-b border-r text-center text-sm">
                      {year}
                    </td>
                    <td className="px-4 py-2 border-b border-r text-sm">
                      <div className="max-w-[200px] truncate">
                        {group.equipment?.installation_location || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {group.equipment?.client || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b border-r text-center text-sm font-semibold">
                      A
                    </td>
                    {months.map((_, monthIndex) => {
                      const monthNumber = monthIndex + 1;
                      const monthData = group.monthlyData[monthNumber];
                      
                      return (
                        <td 
                          key={monthIndex}
                          className={`px-2 py-2 border-b border-r text-center font-bold text-sm ${getCellColor(monthData)}`}
                        >
                          {getCellText(monthData)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tipos de Manutenção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-yellow-100 border border-yellow-300 rounded flex items-center justify-center text-xs font-bold">A</div>
              <span className="text-sm">Manutenção Anual</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 border border-blue-300 rounded flex items-center justify-center text-xs font-bold">S</div>
              <span className="text-sm">Manutenção Semestral</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-purple-100 border border-purple-300 rounded flex items-center justify-center text-xs font-bold">T</div>
              <span className="text-sm">Manutenção Trimestral</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 border border-green-300 rounded flex items-center justify-center text-xs font-bold">B</div>
              <span className="text-sm">Manutenção Bimestral</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-xs font-bold">M</div>
              <span className="text-sm">Manutenção Mensal</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status das Manutenções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-200 border border-green-400 rounded"></div>
              <span className="text-sm">Executada</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-200 border border-red-400 rounded"></div>
              <span className="text-sm">Atrasada</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-orange-200 border border-orange-400 rounded"></div>
              <span className="text-sm">Pendente</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded"></div>
              <span className="text-sm">Agendada</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Função auxiliar para obter família da periodicidade
const getPeriodicityFamily = (periodicity?: string): string => {
  const families = {
    'monthly': 'MEN',
    'bimonthly': 'BIM',
    'quarterly': 'TRI',
    'semestral': 'SEM',
    'annual': 'ANU'
  };
  return families[periodicity as keyof typeof families] || 'MEN';
};

export default PreventiveScheduleMatrixView;