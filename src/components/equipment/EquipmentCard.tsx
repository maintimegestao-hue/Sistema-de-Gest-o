
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, QrCode, Edit, Trash2, Wrench, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface Equipment {
  id: string;
  name: string;
  qr_code?: string;
  serial_number?: string;
  status: string;
  client?: string;
  installation_location?: string;
  maintenance_status?: string;
}

interface EquipmentCardProps {
  equipment: Equipment;
  onGenerateLabel: (equipment: Equipment) => void;
  onDelete: (id: string) => void;
  onEdit: (equipment: Equipment) => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  onGenerateLabel,
  onDelete,
  onEdit
}) => {
  const getMaintenanceStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'awaiting':
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getMaintenanceStatusText = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'awaiting':
      default:
        return 'Aguardando';
    }
  };

  const getMaintenanceStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'awaiting':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    const colors = {
      operational: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
      broken: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      operational: 'Operacional',
      maintenance: 'Em Manutenção',
      inactive: 'Inativo',
      broken: 'Avariado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleExecuteMaintenance = () => {
    navigate('/execute-maintenance', {
      state: {
        selectedEquipmentId: equipment.id,
        equipmentName: equipment.name
      }
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-evolutec-black mb-2">
              {equipment.name}
            </h3>
            <div className="flex gap-2 mb-2">
              <Badge className={`${getStatusColor(equipment.status)}`}>
                {getStatusLabel(equipment.status)}
              </Badge>
              <Badge className={`${getMaintenanceStatusColor(equipment.maintenance_status)} flex items-center gap-1`}>
                {getMaintenanceStatusIcon(equipment.maintenance_status)}
                {getMaintenanceStatusText(equipment.maintenance_status)}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onGenerateLabel(equipment)}>
                <QrCode size={16} className="mr-2" />
                Gerar Etiqueta QR
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExecuteMaintenance}>
                <Wrench size={16} className="mr-2" />
                Executar Manutenção
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(equipment)}>
                <Edit size={16} className="mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(equipment.id)}
                className="text-red-600"
              >
                <Trash2 size={16} className="mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 text-sm text-evolutec-text">
          {equipment.serial_number && (
            <div>
              <span className="font-medium">Série:</span> {equipment.serial_number}
            </div>
          )}
          {equipment.client && (
            <div>
              <span className="font-medium">Cliente:</span> {equipment.client}
            </div>
          )}
          {equipment.installation_location && (
            <div>
              <span className="font-medium">Local:</span> {equipment.installation_location}
            </div>
          )}
          {equipment.qr_code && (
            <div>
              <span className="font-medium">QR Code:</span> {equipment.qr_code}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentCard;
