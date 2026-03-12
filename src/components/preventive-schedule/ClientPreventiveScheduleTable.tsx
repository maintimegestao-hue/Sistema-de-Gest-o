import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock, AlertTriangle, Wrench } from 'lucide-react';

interface PreventiveScheduleItem {
  id: string;
  equipment_id: string;
  year: number;
  month: number;
  due_date: string;
  status: string;
  completed_date?: string;
  equipment?: {
    name: string;
    installation_location?: string;
    client?: string;
    preventive_periodicity?: string;
    status?: string;
  };
}

interface Props {
  scheduleData: PreventiveScheduleItem[];
  year: number;
  clientName: string;
}

const ClientPreventiveScheduleTable: React.FC<Props> = ({ scheduleData, year, clientName }) => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Executada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Atrasada</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Aguardando</Badge>;
    }
  };

  const getPeriodicityType = (month: number, periodicity: string) => {
    const isAnnual = month === 1;
    const isSemestral = month === 1 || month === 7;
    const isQuarterly = month === 1 || month === 4 || month === 7 || month === 10;
    const isBimonthly = month % 2 === 1;

    if (periodicity === 'annual' && isAnnual) return 'Anual';
    if (periodicity === 'semestral' && isSemestral) return 'Semestral';
    if (periodicity === 'quarterly' && isQuarterly) return 'Trimestral';
    if (periodicity === 'bimonthly' && isBimonthly) return 'Bimestral';
    if (periodicity === 'monthly') return 'Mensal';
    return 'Mensal';
  };

  // Agrupar dados por equipamento
  const equipmentGroups = scheduleData.reduce((acc, item) => {
    const equipmentId = item.equipment_id;
    if (!acc[equipmentId]) {
      acc[equipmentId] = {
        equipment: item.equipment,
        months: []
      };
    }
    acc[equipmentId].months.push(item);
    return acc;
  }, {} as Record<string, { equipment: any; months: PreventiveScheduleItem[] }>);

  if (Object.keys(equipmentGroups).length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum equipamento encontrado para este cliente.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Cronograma Preventivo Anual {year}</h2>
        <p className="text-blue-100">Cliente: {clientName}</p>
        <p className="text-blue-100">Total de equipamentos: {Object.keys(equipmentGroups).length}</p>
      </div>

      {Object.entries(equipmentGroups).map(([equipmentId, group]) => (
        <Card key={equipmentId} className="overflow-hidden">
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              {group.equipment?.name || 'Equipamento não identificado'}
            </CardTitle>
            <p className="text-sm text-gray-600">
              Local: {group.equipment?.installation_location || 'Não informado'} | 
              Periodicidade: {group.equipment?.preventive_periodicity || 'Não definida'}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {months.map((monthName, index) => {
                const monthNumber = index + 1;
                const monthData = group.months.find(m => m.month === monthNumber);
                
                if (!monthData) return null;

                const periodicityType = getPeriodicityType(monthNumber, group.equipment?.preventive_periodicity || 'monthly');
                
                return (
                  <div key={monthNumber} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">{monthName}</h4>
                      {getStatusIcon(monthData.status)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-600">{periodicityType}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Vencimento:</span>
                        <span className="font-medium">
                          {new Date(monthData.due_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      {monthData.completed_date && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Executada em:</span>
                          <span className="font-medium text-green-600">
                            {new Date(monthData.completed_date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                      
                      <div className="mt-3">
                        {getStatusBadge(monthData.status)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClientPreventiveScheduleTable;