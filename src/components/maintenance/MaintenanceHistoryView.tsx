import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  Wrench,
  Building2,
  Search,
  Filter,
  Image,
  FileText,
  Palette,
  AlertCircle
} from 'lucide-react';
import { useSecureMaintenanceOrders } from '@/hooks/useSecureMaintenanceOrders';
import { useMaintenanceExportWithAttachments } from '@/hooks/useMaintenanceExportWithAttachments';
import { useSecureClients } from '@/hooks/useSecureClients';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useMaintenanceExecutions } from '@/hooks/useMaintenanceExecutions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PDFCustomizationModal, { PDFCustomizationOptions } from '@/components/pdf/PDFCustomizationModal';
import { useClientContext } from '@/contexts/ClientContext';

const MaintenanceHistoryView = () => {
  const { selectedClientId } = useClientContext();
  const { data: maintenanceOrders, isLoading, error } = useSecureMaintenanceOrders(selectedClientId);
  const { data: maintenanceExecutions } = useMaintenanceExecutions();
  const { data: clients } = useSecureClients();
  const { data: userProfile } = useUserProfile();
  const { exportMaintenanceToPDF } = useMaintenanceExportWithAttachments();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [attachmentsMap, setAttachmentsMap] = useState<Record<string, any[]>>({});

  // Debug logs
  useEffect(() => {
    console.log('🔍 MaintenanceHistoryView - Debug Info:');
    console.log('👤 selectedClientId:', selectedClientId);
    console.log('📋 maintenanceOrders:', maintenanceOrders);
    console.log('⏳ isLoading:', isLoading);
    console.log('❌ error:', error);
    console.log('👥 clients:', clients);
    console.log('👤 userProfile:', userProfile);
  }, [selectedClientId, maintenanceOrders, isLoading, error, clients, userProfile]);

  useEffect(() => {
    const fetchAttachments = async () => {
      if (!maintenanceOrders || maintenanceOrders.length === 0) {
        console.log('📋 Nenhuma manutenção para buscar anexos');
        return;
      }
      
      try {
        console.log('🔍 Buscando anexos para', maintenanceOrders.length, 'manutenções');
        const ids = maintenanceOrders.map((o: any) => o.id);
        const { data, error } = await supabase
          .from('maintenance_attachments')
          .select('*')
          .in('maintenance_order_id', ids);
        
        if (error) {
          console.error('❌ Erro ao buscar anexos:', error);
          return;
        }
        
        console.log('✅ Anexos encontrados:', data?.length || 0);
        const grouped: Record<string, any[]> = {};
        (data || []).forEach((att: any) => {
          const key = att.maintenance_order_id;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(att);
        });
        setAttachmentsMap(grouped);
      } catch (e) {
        console.error('❌ Erro inesperado ao buscar anexos:', e);
      }
    };
    fetchAttachments();
  }, [maintenanceOrders]);

  const filteredOrders = maintenanceOrders?.filter(order => {
    const matchesSearch = order.equipments?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.technicians?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesType = typeFilter === 'all' || order.maintenance_type === typeFilter;
    const matchesClient = clientFilter === 'all' || order.client_id === clientFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesClient;
  });

  // Debug filtered orders
  useEffect(() => {
    console.log('🔍 filteredOrders:', filteredOrders);
    console.log('🔍 searchTerm:', searchTerm);
    console.log('🔍 statusFilter:', statusFilter);
    console.log('🔍 typeFilter:', typeFilter);
    console.log('🔍 clientFilter:', clientFilter);
  }, [filteredOrders, searchTerm, statusFilter, typeFilter, clientFilter]);

  const getStatusColor = (status: string) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'completed': 'Concluída',
      'in_progress': 'Em Andamento',
      'pending': 'Pendente',
      'cancelled': 'Cancelada'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getMaintenanceTypeLabel = (type: string) => {
    const labels = {
      'preventive': 'Preventiva',
      'corrective': 'Corretiva',
      'emergency': 'Emergencial'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const deleteMaintenanceMutation = useMutation({
    mutationFn: async (orderId: string) => {
      // Deletar anexos relacionados
      const { error: attachmentsError } = await supabase
        .from('maintenance_attachments')
        .delete()
        .eq('maintenance_order_id', orderId);

      if (attachmentsError) {
        console.error('❌ Erro ao deletar anexos:', attachmentsError);
      }

      // Deletar execução relacionada
      const { error: executionError } = await supabase
        .from('maintenance_executions')
        .delete()
        .eq('maintenance_order_id', orderId);

      if (executionError) {
        console.error('❌ Erro ao deletar execução:', executionError);
      }

      // Deletar ordem de manutenção
      const { error: orderError } = await supabase
        .from('maintenance_orders')
        .delete()
        .eq('id', orderId);

      if (orderError) {
        throw orderError;
      }

      return orderId;
    },
    onSuccess: () => {
      toast.success('Manutenção excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['secure-maintenance-orders'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-executions'] });
    },
    onError: (error) => {
      console.error('Erro ao excluir manutenção:', error);
      toast.error('Erro ao excluir manutenção');
    }
  });

  const handleEdit = (orderId: string) => {
    // Navegar para página de edição
    window.location.href = `/execute-maintenance?edit=${orderId}`;
  };

  const handleDelete = (orderId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta manutenção? Esta ação não pode ser desfeita.')) {
      deleteMaintenanceMutation.mutate(orderId);
    }
  };

  const handleDownloadPDF = async (order: any) => {
    // Abrir modal de personalização para permitir logo e dimensionamento
    const execution = maintenanceExecutions?.find(exec => exec.maintenance_order_id === order.id);
    const orderWithExecution = { ...order, execution };
    setSelectedOrder(orderWithExecution);
    setShowCustomizationModal(true);
  };

  const handleDownloadOriginal = async () => {
    if (selectedOrder) {
      await exportMaintenanceToPDF(selectedOrder);
      setShowCustomizationModal(false);
    }
  };

  const handleDownloadCustomized = async (options: PDFCustomizationOptions) => {
    if (selectedOrder) {
      await exportMaintenanceToPDF(selectedOrder, options);
      setShowCustomizationModal(false);
    }
  };

  const handlePreview = async (options: PDFCustomizationOptions): Promise<string> => {
    if (selectedOrder) {
      return await exportMaintenanceToPDF(selectedOrder, options, true) as string;
    }
    throw new Error('Nenhuma ordem selecionada');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Manutenção</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as manutenções realizadas
          </p>
        </div>
      </div>

      {/* Debug Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="text-sm text-blue-800">
            <strong>🔍 Debug Info:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Cliente selecionado: {selectedClientId || 'Nenhum'}</li>
              <li>Manutenções carregadas: {maintenanceOrders?.length || 0}</li>
              <li>Status: {isLoading ? 'Carregando...' : error ? 'Erro' : 'Pronto'}</li>
              <li>Filtros aplicados: {searchTerm || 'Nenhum'} | {statusFilter} | {typeFilter} | {clientFilter}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {isLoading && <LoadingSpinner />}
      
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <strong>Erro ao carregar histórico:</strong> {error.message}
            </div>
            <p className="text-sm text-red-700 mt-2">
              Verifique se você está logado e se há manutenções cadastradas no sistema.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por equipamento, descrição ou técnico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="preventive">Preventiva</SelectItem>
                <SelectItem value="corrective">Corretiva</SelectItem>
                <SelectItem value="emergency">Emergencial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Clientes</SelectItem>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Manutenções */}
      <div className="grid gap-6">
        {filteredOrders?.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">
                      {order.equipments?.name || 'Equipamento não identificado'}
                    </h3>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                    <Badge variant="outline">
                      {getMaintenanceTypeLabel(order.maintenance_type)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {order.equipments?.installation_location || 'Local não informado'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    {order.technicians?.name && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {order.technicians.name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPDF(order)}
                    className="flex items-center gap-2"
                  >
                    <Palette className="h-4 w-4" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(order.id)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(order.id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descrição
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {order.description || 'Sem descrição disponível'}
                  </p>
                </div>

                {/* Checklist executado */}
                {(() => {
                  const execution = maintenanceExecutions?.find(exec => exec.maintenance_order_id === order.id);
                  if (execution?.checklist_items && Array.isArray(execution.checklist_items) && execution.checklist_items.length > 0) {
                    return (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          Checklist Executado
                        </h4>
                        <div className="space-y-1">
                          {execution.checklist_items.map((item: any, index: number) => {
                            if (typeof item === 'string') {
                              return (
                                <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                  {item}
                                </div>
                              );
                            }
                            if (item && typeof item === 'object') {
                              const statusColor = item.status === 'conforme' ? 'bg-green-500' : 
                                                item.status === 'nao_conforme' ? 'bg-red-500' : 'bg-gray-400';
                              const statusLabel = item.status === 'conforme' ? 'Conforme' : 
                                                item.status === 'nao_conforme' ? 'Não conforme' : '';
                              return (
                                <div key={index} className="text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
                                    <span>{item.item || item}</span>
                                    {statusLabel && <Badge variant="outline" className="text-xs">{statusLabel}</Badge>}
                                  </div>
                                   {item.comment && (
                                     <div className="ml-4 text-xs text-muted-foreground italic">
                                       💬 {item.comment}
                                     </div>
                                   )}
                                   {/* Anexos do item do checklist */}
                                   {item.attachments && Array.isArray(item.attachments) && item.attachments.length > 0 && (
                                     <div className="ml-4 mt-2">
                                       <div className="flex flex-wrap gap-2">
                                          {item.attachments.map((attachment: any, attachIndex: number) => {
                                            // Normalizar URL para garantir que funciona
                                            let imageUrl = attachment.url || attachment;
                                            if (imageUrl && typeof imageUrl === 'string' && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                                              imageUrl = `https://umrkqohjbhcrxvnvvvli.supabase.co/storage/v1/object/public/maintenance-attachments/${imageUrl}`;
                                            }
                                            return (
                                              <div key={attachIndex} className="relative group">
                                                <img
                                                  src={imageUrl}
                                                  alt={`Anexo ${attachIndex + 1}`}
                                                  className="w-24 h-24 object-cover rounded-md border cursor-pointer hover:scale-105 transition-transform"
                                                  onClick={() => window.open(imageUrl, '_blank')}
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-md transition-all duration-200 flex items-center justify-center">
                                                  <span className="text-white text-xs opacity-0 group-hover:opacity-100">Ver</span>
                                                </div>
                                              </div>
                                            )
                                          })}
                                       </div>
                                     </div>
                                   )}
                                 </div>
                               );
                             }
                             return null;
                           })}
                         </div>
                       </div>
                     );
                   }
                   return null;
                 })()}
                
                {/* Anexos da manutenção */}
                {(() => {
                  const orderAttachments = (attachmentsMap as any)[order.id] as any[] | undefined;
                  if (orderAttachments && orderAttachments.length > 0) {
                    return (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          Anexos
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {orderAttachments.map((att: any, idx: number) => {
                            const { data: urlData } = supabase.storage
                              .from('maintenance-attachments')
                              .getPublicUrl(att.file_path);
                            const url = urlData?.publicUrl;
                            if (att.file_type === 'photo' && url) {
                              return (
                                <div key={idx} className="relative group">
                                  <img
                                    src={url}
                                    alt={att.file_name}
                                    className="w-16 h-16 object-cover rounded-md border cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => window.open(url, '_blank')}
                                  />
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <Separator />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>O.S. #{order.id.slice(-8)}</span>
                  <span>Atualizado em {new Date(order.updated_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!filteredOrders || filteredOrders.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma manutenção encontrada</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || clientFilter !== 'all'
                ? 'Tente ajustar os filtros para ver mais resultados.'
                : 'Ainda não há manutenções registradas no sistema.'}
            </p>
            {!isLoading && !error && (
              <div className="mt-4 text-sm text-blue-600">
                💡 Dica: Verifique se você está logado e se há manutenções cadastradas.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <PDFCustomizationModal
        isOpen={showCustomizationModal}
        onClose={() => setShowCustomizationModal(false)}
        onDownloadOriginal={handleDownloadOriginal}
        onDownloadCustomized={handleDownloadCustomized}
        onPreview={handlePreview}
        title="Relatório de Manutenção PDF"
        logoUrl={userProfile?.company_logo_url}
        showLogoScale={true}
        showLogoWidth={true}
        showLogoHeight={true}
        showLogoPosition={true}
        showSpacingControls={true}
        showTitleSpacing={true}
        showSectionSpacing={true}
        showContentPadding={true}
      />
    </div>
  );
};

export default MaintenanceHistoryView;