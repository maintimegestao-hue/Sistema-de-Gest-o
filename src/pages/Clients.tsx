
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Plus, Search, Filter, Eye, Users, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import FormModal from "@/components/modals/FormModal";
import NewClientForm from "@/components/forms/NewClientForm";
import EditClientForm from "@/components/forms/EditClientForm";
import { useSecureClients, useDeleteSecureClient } from "@/hooks/useSecureClients";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const Clients = () => {
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: clients, isLoading, error } = useSecureClients();
  const deleteClientMutation = useDeleteSecureClient();
  const { toast } = useToast();

  const handleNewClientSuccess = () => {
    setIsNewClientModalOpen(false);
  };

  const handleEditClientSuccess = () => {
    setIsEditClientModalOpen(false);
    setSelectedClient(null);
  };

  const handleEditClient = (client: any) => {
    setSelectedClient(client);
    setIsEditClientModalOpen(true);
  };

  const handleDeleteClient = async (id: string, clientName: string) => {
    try {
      await deleteClientMutation.mutateAsync(id);
      toast({
        title: 'Sucesso!',
        description: `Cliente "${clientName}" foi excluído com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o cliente. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const filteredClients = clients?.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.cnpj?.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-evolutec-green mx-auto mb-2"></div>
            <p className="text-evolutec-text">Carregando clientes...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-600 p-8">
          Erro ao carregar clientes: {error.message}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-evolutec-black">Clientes</h1>
              <p className="text-evolutec-text mt-2">
                Gerencie seus clientes e visualize informações específicas por cliente
              </p>
            </div>
            <Button 
              className="evolutec-btn"
              onClick={() => setIsNewClientModalOpen(true)}
            >
              <Plus size={16} className="mr-2" />
              Novo Cliente
            </Button>
          </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter size={20} />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Nome, email ou CNPJ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Visualização</label>
                <Button variant="outline" className="w-full">
                  <Users size={16} className="mr-2" />
                  Ver Dashboard Geral
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Clientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients?.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="" alt={client.name} />
                      <AvatarFallback className="bg-evolutec-green text-white">
                        {getClientInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <CardDescription>
                        {client.contact_person && `Contato: ${client.contact_person}`}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(client.status || 'active')}>
                    {client.status === 'active' ? 'Ativo' : 
                     client.status === 'inactive' ? 'Inativo' : 'Pendente'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  {client.email && (
                    <p className="flex items-center text-evolutec-text">
                      📧 {client.email}
                    </p>
                  )}
                  {client.phone && (
                    <p className="flex items-center text-evolutec-text">
                      📞 {client.phone}
                    </p>
                  )}
                  {client.cnpj && (
                    <p className="flex items-center text-evolutec-text">
                      🏢 {client.cnpj}
                    </p>
                  )}
                  {client.city && client.state && (
                    <p className="flex items-center text-evolutec-text">
                      📍 {client.city}, {client.state}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {/* TODO: Navigate to client dashboard */}}
                  >
                    <Eye size={14} className="mr-1" />
                    Ver Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditClient(client)}
                  >
                    <Edit size={14} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 size={14} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o cliente "{client.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteClient(client.id, client.name)}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={deleteClientMutation.isPending}
                        >
                          {deleteClientMutation.isPending ? 'Excluindo...' : 'Excluir'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients?.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum cliente encontrado
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== "all" 
                  ? "Tente ajustar os filtros para encontrar clientes."
                  : "Comece adicionando seu primeiro cliente."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button 
                  className="evolutec-btn"
                  onClick={() => setIsNewClientModalOpen(true)}
                >
                  <Plus size={16} className="mr-2" />
                  Adicionar Primeiro Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        </div>
      </DashboardLayout>
      
      <FormModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        title="Novo Cliente"
      >
        <NewClientForm onSuccess={handleNewClientSuccess} />
      </FormModal>

      <FormModal
        isOpen={isEditClientModalOpen}
        onClose={() => {
          setIsEditClientModalOpen(false);
          setSelectedClient(null);
        }}
        title={`Editar Cliente: ${selectedClient?.name || ''}`}
      >
        {selectedClient && (
          <EditClientForm 
            client={selectedClient} 
            onSuccess={handleEditClientSuccess} 
          />
        )}
      </FormModal>
    </ProtectedRoute>
  );
};

export default Clients;
