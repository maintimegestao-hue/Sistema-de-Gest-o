import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { Filter, Search, Eye, Calendar, MapPin, User, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useServiceCalls } from "@/hooks/useServiceCalls";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useClients } from "@/hooks/useClients";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePageAuth } from "@/hooks/usePageAuth";

const ServiceCalls = () => {
  const { user } = useAuth();
  
  // Verificar autenticação
  usePageAuth();
  
  const { data: userProfile } = useUserProfile();
  const { data: serviceCalls, isLoading } = useServiceCalls(userProfile?.user_id);
  const { data: clients } = useClients();
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberto';
      case 'in_progress':
        return 'Em Atendimento';
      case 'resolved':
        return 'Resolvido';
      default:
        return 'Aguardando';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'in_progress':
        return 'secondary';
      case 'resolved':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredCalls = serviceCalls?.filter(call => {
    if (searchTerm && !call.call_number?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !call.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (filterClient && filterClient !== 'all' && call.client_id !== filterClient) return false;
    if (filterStatus && filterStatus !== 'all' && call.status !== filterStatus) return false;
    
    if ((filterMonth && filterMonth !== 'all') || (filterYear && filterYear !== 'all')) {
      const callDate = new Date(call.created_at);
      if (filterMonth && filterMonth !== 'all' && (callDate.getMonth() + 1).toString() !== filterMonth) return false;
      if (filterYear && filterYear !== 'all' && callDate.getFullYear().toString() !== filterYear) return false;
    }

    return true;
  });

  const handleViewCall = (call: any) => {
    setSelectedCall(call);
    setIsViewModalOpen(true);
  };

  // Se não estiver autenticado, não renderizar nada (usePageAuth vai redirecionar)
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Chamados de Serviço</h1>
              <p className="text-muted-foreground mt-2">
                Gerencie todos os chamados abertos pelos clientes
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por número ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="in_progress">Em Atendimento</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os anos</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de Chamados */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Chamados ({filteredCalls?.length || 0})
              </h2>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-muted rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredCalls?.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum chamado encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCalls?.map((call) => (
                    <Card key={call.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {getStatusIcon(call.status)}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{call.call_number}</h3>
                                <Badge variant={getStatusVariant(call.status)}>
                                  {getStatusLabel(call.status)}
                                </Badge>
                                <span className={`text-sm font-medium ${getPriorityColor(call.priority)}`}>
                                  {call.priority === 'high' ? 'Alta' : call.priority === 'medium' ? 'Média' : 'Baixa'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span>{(call as any).clients?.name || (call as any).clients?.[0]?.name || 'Cliente não informado'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{(call as any).equipments?.name || (call as any).equipments?.[0]?.name || 'Equipamento não informado'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(call.created_at).toLocaleDateString('pt-BR')}</span>
                                </div>
                              </div>
                              {call.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {call.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCall(call)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* Modal de Visualização */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Chamado {selectedCall?.call_number}</DialogTitle>
          </DialogHeader>
          
          {selectedCall && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Informações Básicas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={getStatusVariant(selectedCall.status)}>
                        {getStatusLabel(selectedCall.status)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prioridade:</span>
                      <span className={getPriorityColor(selectedCall.priority)}>
                        {selectedCall.priority === 'high' ? 'Alta' : selectedCall.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cliente:</span>
                      <span>{(selectedCall as any).clients?.name || (selectedCall as any).clients?.[0]?.name || 'Cliente não informado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Equipamento:</span>
                      <span>{(selectedCall as any).equipments?.name || (selectedCall as any).equipments?.[0]?.name || 'Equipamento não informado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Criado em:</span>
                      <span>{new Date(selectedCall.created_at).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Problemas Reportados</h4>
                  <div className="space-y-1">
                    {selectedCall.problem_types?.map((problem: string, index: number) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1">
                        {problem}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {selectedCall.description && (
                <div>
                  <h4 className="font-semibold mb-2">Descrição do Problema</h4>
                  <p className="text-sm p-3 bg-muted rounded-lg">
                    {selectedCall.description}
                  </p>
                </div>
              )}

              {selectedCall.client_notes && (
                <div>
                  <h4 className="font-semibold mb-2">Observações do Cliente</h4>
                  <p className="text-sm p-3 bg-muted rounded-lg">
                    {selectedCall.client_notes}
                  </p>
                </div>
              )}

              {selectedCall.photos && selectedCall.photos.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Fotos do Problema</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedCall.photos.map((photo: any, index: number) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <img 
                          src={photo.url || photo} 
                          alt={`Foto ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ServiceCalls;