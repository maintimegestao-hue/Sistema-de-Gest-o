
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PreventiveScheduleCardProps {
  data: {
    preventiveSchedule: {
      totalScheduled: number;
      completed: number;
      pending: number;
      overdue: number;
    };
  };
}

const PreventiveScheduleCard: React.FC<PreventiveScheduleCardProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status do Cronograma Preventivo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{data.preventiveSchedule.totalScheduled}</p>
            <p className="text-sm text-gray-600">Total Agendado</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{data.preventiveSchedule.completed}</p>
            <p className="text-sm text-gray-600">Executadas</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{data.preventiveSchedule.pending}</p>
            <p className="text-sm text-gray-600">Pendentes</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{data.preventiveSchedule.overdue}</p>
            <p className="text-sm text-gray-600">Em Atraso</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreventiveScheduleCard;
