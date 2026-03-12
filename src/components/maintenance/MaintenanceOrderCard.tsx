
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Trash2,
  Eye,
  Download,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMaintenanceExportWithAttachments } from '@/hooks/useMaintenanceExportWithAttachments';
import { useMaintenanceExportWord } from '@/hooks/useMaintenanceExportWord';

interface MaintenanceOrderCardProps {
  order: any;
  onExecute?: (orderId: string) => void;
  onComplete?: (orderId: string) => void;
  onDelete?: (orderId: string) => void;
}

const MaintenanceOrderCard: React.FC<MaintenanceOrderCardProps> = ({
  order,
  onExecute,
  onComplete,
  onDelete
}) => {
  const { exportMaintenanceToPDF } = useMaintenanceExportWithAttachments();
  const { exportMaintenanceToWord } = useMaintenanceExportWord();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleViewOrder = () => {
    console.log('Visualizando ordem:', order);
  };

  const handleExportPDF = () => {
    exportMaintenanceToPDF(order);
  };

  const handleExportWord = () => {
    exportMaintenanceToWord(order);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(order.status)}
            <span className="font-semibold text-evolutec-black">
              O.S. #{order.id.slice(-6)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getPriorityColor(order.priority)} className="text-xs">
              {order.priority}
            </Badge>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-evolutec-text line-clamp-2">
            {order.description}
          </p>
          
          {order.equipments?.name && (
            <div className="flex items-center gap-1 text-xs text-evolutec-text">
              <MapPin className="w-3 h-3" />
              <span>{order.equipments.name}</span>
              {order.equipments.installation_location && (
                <span>- {order.equipments.installation_location}</span>
              )}
            </div>
          )}

          {order.technicians?.name && (
            <div className="flex items-center gap-1 text-xs text-evolutec-text">
              <User className="w-3 h-3" />
              <span>{order.technicians.name}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-evolutec-text">
            <Calendar className="w-3 h-3" />
            <span>
              {order.scheduled_date
                ? new Date(order.scheduled_date).toLocaleDateString('pt-BR')
                : new Date(order.created_at).toLocaleDateString('pt-BR')
              }
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {order.status === 'pending' && onExecute && (
              <Button
                size="sm"
                onClick={() => onExecute(order.id)}
                className="evolutec-btn text-xs"
              >
                <Play className="w-3 h-3 mr-1" />
                Executar
              </Button>
            )}
            
            {order.status === 'in_progress' && onComplete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onComplete(order.id)}
                className="text-xs"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Concluir
              </Button>
            )}
          </div>

          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleViewOrder}
              title="Visualizar"
            >
              <Eye className="w-4 h-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" title="Exportar">
                  <Download className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportWord}>
                  <FileText className="w-4 h-4 mr-2" />
                  Baixar Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(order.id)}
                className="text-red-600 hover:text-red-700"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceOrderCard;
