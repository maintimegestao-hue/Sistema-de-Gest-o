import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Building2,
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSecureClients } from '@/hooks/useSecureClients';
import { usePreventiveScheduleByClient } from '@/hooks/usePreventiveScheduleByClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ClientPreventiveScheduleTable from './ClientPreventiveScheduleTable';

interface ClientPreventiveScheduleViewProps {
  clientId?: string;
}

const ClientPreventiveScheduleView: React.FC<ClientPreventiveScheduleViewProps> = ({ clientId }) => {
  const navigate = useNavigate();
  const { data: clients, isLoading: loadingClients } = useSecureClients();
  const [selectedClient, setSelectedClient] = useState(clientId || '');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const { data: scheduleData, isLoading: loadingSchedule } = usePreventiveScheduleByClient(
    selectedClient, 
    selectedYear
  );

  if (loadingClients || loadingSchedule) return <LoadingSpinner />;

  const client = clients?.find(c => c.id === selectedClient);

  const getStatusColor = (status: string) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'overdue': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'completed': 'Executada',
      'scheduled': 'Agendada',
      'overdue': 'Em Atraso'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getPeriodicityLabel = (periodicity: string) => {
    const labels = {
      'monthly': 'Mensal',
      'bimonthly': 'Bimestral',
      'quarterly': 'Trimestral',
      'semestral': 'Semestral',
      'annual': 'Anual'
    };
    return labels[periodicity as keyof typeof labels] || periodicity;
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/preventive-schedule')}
              className="flex items-center gap-2 w-fit"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Cronograma Preventivo
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            {client ? `Cronograma de manutenção preventiva - ${client.name}` : 'Selecione um cliente para visualizar o cronograma'}
          </p>
        </div>
        {selectedClient && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={(new Date().getFullYear() - 1).toString()}>{new Date().getFullYear() - 1}</SelectItem>
                <SelectItem value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</SelectItem>
                <SelectItem value={(new Date().getFullYear() + 1).toString()}>{new Date().getFullYear() + 1}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Seletor de Cliente */}
      {!clientId && (
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {selectedClient && scheduleData && (
        <ClientPreventiveScheduleTable 
          scheduleData={scheduleData}
          year={selectedYear}
          clientName={client?.name || 'Cliente'}
        />
      )}

      {selectedClient && (!scheduleData || scheduleData.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum cronograma encontrado</h3>
            <p className="text-muted-foreground text-center">
              Este cliente não possui equipamentos com cronograma preventivo para o ano selecionado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientPreventiveScheduleView;