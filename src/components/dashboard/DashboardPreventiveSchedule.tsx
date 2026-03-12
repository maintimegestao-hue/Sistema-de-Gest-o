import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, AlertTriangle, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePreventiveScheduleByClient } from '@/hooks/usePreventiveScheduleByClient';
import { useClientContext } from '@/contexts/ClientContext';
import { useNavigate } from 'react-router-dom';

const DashboardPreventiveSchedule = () => {
  const navigate = useNavigate();
  const { selectedClientId, selectedClientName } = useClientContext();
  const [selectedYear] = useState(new Date().getFullYear());
  const { data: scheduleData, isLoading } = usePreventiveScheduleByClient(selectedClientId || '', selectedYear);

  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 border-blue-200';
      case 'overdue':
        return 'bg-red-100 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Agrupar por equipamento
  const groupedByEquipment = scheduleData?.reduce((acc, item) => {
    const equipmentId = item.equipment_id;
    if (!acc[equipmentId]) {
      acc[equipmentId] = {
        equipment: item.equipment,
        schedules: []
      };
    }
    acc[equipmentId].schedules.push(item);
    return acc;
  }, {} as Record<string, { equipment: any; schedules: any[] }>);

  const equipmentsList = Object.values(groupedByEquipment || {});

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma Preventivo Anual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!equipmentsList || equipmentsList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma Preventivo Anual - {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">Nenhum cronograma encontrado</p>
            <p className="text-sm text-muted-foreground mt-2">
              {selectedClientName ? `Gere o cronograma para ${selectedClientName}` : 'Selecione um cliente'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cronograma Preventivo Anual - {selectedYear}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/client-preventive-schedule/${selectedClientId}`)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Ver Completo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {equipmentsList.slice(0, 3).map((item, index) => {
            // Criar array de 12 meses
            const monthsSchedule = Array.from({ length: 12 }, (_, monthIndex) => {
              const month = monthIndex + 1;
              const scheduleItem = item.schedules.find(s => s.month === month);
              return {
                month,
                hasSchedule: !!scheduleItem,
                status: scheduleItem?.status || 'empty',
                item: scheduleItem
              };
            });

            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-foreground">
                      {item.equipment?.name || 'Equipamento'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      📍 {item.equipment?.installation_location || 'Local não informado'}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.equipment?.preventive_periodicity || 'N/A'}
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-1">
                  {monthsSchedule.map((monthItem) => (
                    <div
                      key={monthItem.month}
                      className={`
                        relative rounded p-1 text-center border transition-all
                        ${monthItem.hasSchedule ? getStatusColor(monthItem.status) : 'bg-gray-50 border-gray-200'}
                        ${monthItem.hasSchedule ? 'cursor-pointer hover:scale-105' : ''}
                      `}
                      title={`${monthNames[monthItem.month - 1]} - ${
                        monthItem.hasSchedule
                          ? `Status: ${monthItem.status}`
                          : 'Sem manutenção agendada'
                      }`}
                    >
                      <div className="text-xs font-medium text-foreground">
                        {monthNames[monthItem.month - 1]}
                      </div>
                      <div className="flex justify-center mt-1">
                        {monthItem.hasSchedule ? (
                          getStatusIcon(monthItem.status)
                        ) : (
                          <div className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {equipmentsList.length > 3 && (
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                +{equipmentsList.length - 3} equipamentos adicionais
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-1 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-muted-foreground">Executada</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-muted-foreground">Agendada</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-muted-foreground">Atrasada</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardPreventiveSchedule;