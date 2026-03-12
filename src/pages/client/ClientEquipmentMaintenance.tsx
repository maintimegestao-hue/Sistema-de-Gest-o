import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useSecureEquipments } from '@/hooks/useSecureEquipments';
import { useSecureMaintenanceOrders } from '@/hooks/useSecureMaintenanceOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ClientEquipmentMaintenance = () => {
  const { clientData } = useClientAuth();
  const navigate = useNavigate();
  
  const { data: equipments, isLoading: equipmentsLoading } = useSecureEquipments(clientData?.clientId);
  const { data: maintenanceOrders } = useSecureMaintenanceOrders();

  // Os equipamentos já vêm filtrados pelo hook quando passamos o clientId
  const clientEquipments = equipments || [];

  if (equipmentsLoading) {
    return <LoadingSpinner />;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Atrasada';
      default:
        return 'Aguardando';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/client-dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 rounded-lg p-2">
                  <Building2 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Manutenção de Equipamentos
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {clientData?.clientName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Seus Equipamentos
          </h2>
          <p className="text-muted-foreground">
            Acompanhe o status e manutenções dos seus equipamentos
          </p>
        </div>

        <div className="grid gap-6">
          {clientEquipments.map((equipment) => {
            // Buscar última manutenção do equipamento
            const equipmentMaintenances = maintenanceOrders?.filter(order => 
              order.equipment_id === equipment.id
            ) || [];
            
            const lastMaintenance = equipmentMaintenances
              .filter(order => order.status === 'completed')
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
            
            const nextMaintenance = equipmentMaintenances
              .filter(order => order.status === 'pending')
              .sort((a, b) => new Date(a.scheduled_date || a.created_at).getTime() - new Date(b.scheduled_date || b.created_at).getTime())[0];

            return (
              <Card key={equipment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{equipment.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {equipment.serial_number} • {equipment.installation_location}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge 
                        variant={equipment.status === 'operational' ? 'default' : 'secondary'}
                      >
                        {equipment.status === 'operational' ? 'Operacional' : 'Em Manutenção'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">
                        Status da Manutenção
                      </h4>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(equipment.maintenance_status)}
                        <Badge variant={getStatusVariant(equipment.maintenance_status)}>
                          {getStatusText(equipment.maintenance_status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">
                        Última Manutenção
                      </h4>
                      <p className="text-sm">
                        {lastMaintenance 
                          ? new Date(lastMaintenance.created_at).toLocaleDateString('pt-BR')
                          : 'Nenhuma manutenção registrada'
                        }
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">
                        Próxima Manutenção
                      </h4>
                      <p className="text-sm">
                        {nextMaintenance 
                          ? new Date(nextMaintenance.scheduled_date || nextMaintenance.created_at).toLocaleDateString('pt-BR')
                          : 'Nenhuma manutenção agendada'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClientEquipmentMaintenance;