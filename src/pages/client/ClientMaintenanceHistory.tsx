import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useSecureMaintenanceOrders } from '@/hooks/useSecureMaintenanceOrders';
import { useSecureEquipments } from '@/hooks/useSecureEquipments';
import { useSecureTechnicians } from '@/hooks/useSecureTechnicians';
import { useMaintenanceExecutions } from '@/hooks/useMaintenanceExecutions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, Wrench, Download, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PDFCustomizationModal, { PDFCustomizationOptions } from '@/components/pdf/PDFCustomizationModal';
import { useMaintenancePDF } from '@/hooks/useMaintenancePDF';

const ClientMaintenanceHistory = () => {
  const { clientData } = useClientAuth();
  const navigate = useNavigate();
  const [showCustomizationModal, setShowCustomizationModal] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);
  const { exportToPDF } = useMaintenancePDF();

  const { data: maintenanceOrders, isLoading: ordersLoading } = useSecureMaintenanceOrders(clientData?.clientId);
  const { data: equipments } = useSecureEquipments(clientData?.clientId);
  const { data: technicians } = useSecureTechnicians();
  const { data: executions } = useMaintenanceExecutions();

  // Filtrar ordens de manutenção do cliente logado com execuções
  const clientMaintenanceOrders = maintenanceOrders?.filter(order => {
    const hasExecution = executions?.some(exec => exec.maintenance_order_id === order.id);
    return (order.client_id === clientData?.clientId || 
            (order.equipments && 'client_id' in order.equipments && order.equipments.client_id === clientData?.clientId)) && 
           (order.status === 'completed' || hasExecution);
  }) || [];

  if (ordersLoading) {
    return <LoadingSpinner />;
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'preventive':
        return 'Preventiva';
      case 'corrective':
        return 'Corretiva';
      case 'emergency':
        return 'Emergencial';
      default:
        return 'Outros';
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'preventive':
        return 'default';
      case 'corrective':
        return 'secondary';
      case 'emergency':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleDownloadPDF = (order: any) => {
    const execution = executions?.find(exec => exec.maintenance_order_id === order.id);
    const orderWithExecution = { ...order, execution };
    setSelectedOrder(orderWithExecution);
    setShowCustomizationModal(true);
  };

  const handleDownloadOriginal = async () => {
    if (selectedOrder) {
      await exportToPDF(selectedOrder);
      setShowCustomizationModal(false);
    }
  };

  const handleDownloadCustomized = async (options: PDFCustomizationOptions) => {
    if (selectedOrder) {
      await exportToPDF(selectedOrder, options);
      setShowCustomizationModal(false);
    }
  };

  const handlePreview = async (options: PDFCustomizationOptions): Promise<string> => {
    if (selectedOrder) {
      return await exportToPDF(selectedOrder, options, true) as string;
    }
    throw new Error('Nenhuma ordem selecionada');
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
                <div className="bg-purple-100 rounded-lg p-2">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Histórico de Manutenções
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
            Manutenções Realizadas
          </h2>
          <p className="text-muted-foreground">
            Histórico completo das manutenções dos seus equipamentos
          </p>
        </div>

        <div className="space-y-4">
          {clientMaintenanceOrders.map((order) => {
            const equipment = equipments?.find(eq => eq.id === order.equipment_id);
            const technician = technicians?.find(tech => tech.id === order.technician_id);
            const execution = executions?.find(exec => exec.maintenance_order_id === order.id);

            return (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{equipment?.name || 'Equipamento não identificado'}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {equipment?.installation_location || 'Local não especificado'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(order)}
                        className="flex items-center gap-2"
                      >
                        <Palette className="h-4 w-4" />
                        PDF
                      </Button>
                      <Badge variant={getTypeVariant(order.maintenance_type)}>
                        {getTypeLabel(order.maintenance_type)}
                      </Badge>
                      <Badge variant="outline">
                        Concluída
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {execution?.end_datetime 
                          ? new Date(execution.end_datetime).toLocaleDateString('pt-BR')
                          : new Date(order.updated_at).toLocaleDateString('pt-BR')
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{technician?.name || 'Não atribuído'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Manutenção {getTypeLabel(order.maintenance_type)}</span>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-2">Descrição dos Serviços</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.description}
                    </p>
                    {execution?.observations && (
                      <div className="mt-3">
                        <h4 className="font-semibold text-sm mb-2">Observações</h4>
                        <p className="text-sm text-muted-foreground">
                          {execution.observations}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Modal de personalização de PDF */}
        <PDFCustomizationModal
          isOpen={showCustomizationModal}
          onClose={() => setShowCustomizationModal(false)}
          onDownloadOriginal={handleDownloadOriginal}
          onDownloadCustomized={handleDownloadCustomized}
          title="Personalizar PDF de Manutenção"
          onPreview={handlePreview}
          logoUrl={clientData?.clientName ? '/placeholder.svg' : undefined}
        />
      </div>
    </div>
  );
};

export default ClientMaintenanceHistory;