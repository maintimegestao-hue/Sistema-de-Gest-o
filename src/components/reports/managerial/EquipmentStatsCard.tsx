
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EquipmentStatsCardProps {
  data: {
    equipmentStats: Array<{
      name: string;
      client: string;
      totalMaintenances: number;
      lastMaintenance?: string;
    }>;
  };
}

const EquipmentStatsCard: React.FC<EquipmentStatsCardProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipamentos com Mais Manutenções</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.equipmentStats.map((equipment, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{equipment.name}</p>
                <p className="text-sm text-gray-600">{equipment.client}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{equipment.totalMaintenances} manutenções</p>
                {equipment.lastMaintenance && (
                  <p className="text-xs text-gray-500">
                    Última: {new Date(equipment.lastMaintenance).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentStatsCard;
