
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Wrench, CheckCircle, AlertCircle } from 'lucide-react';

interface ManagerialIndicatorCardsProps {
  data: {
    summary: {
      totalMaintenances: number;
      completedMaintenances: number;
      pendingMaintenances: number;
      inProgressMaintenances: number;
    };
  };
}

const ManagerialIndicatorCards: React.FC<ManagerialIndicatorCardsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Manutenções</p>
              <p className="text-2xl font-bold text-evolutec-black">{data.summary.totalMaintenances}</p>
            </div>
            <Wrench className="w-8 h-8 text-evolutec-green" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Executadas</p>
              <p className="text-2xl font-bold text-green-600">{data.summary.completedMaintenances}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{data.summary.pendingMaintenances}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Andamento</p>
              <p className="text-2xl font-bold text-blue-600">{data.summary.inProgressMaintenances}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerialIndicatorCards;
