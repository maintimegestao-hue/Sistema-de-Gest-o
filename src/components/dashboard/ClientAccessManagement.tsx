import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useClients } from '@/hooks/useClients';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Plus, Settings, Trash2 } from 'lucide-react';

interface ClientAccess {
  id: string;
  client_id: string;
  access_code: string;
  is_active: boolean;
  permissions: {
    preventive_schedule?: boolean;
    managerial_reports?: boolean;
    equipment_maintenance?: boolean;
    maintenance_history?: boolean;
    technical_reports?: boolean;
  };
  client_name: string;
  created_at: string;
}

const ClientAccessManagement = () => {
  const [clientAccesses, setClientAccesses] = useState<ClientAccess[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [permissions, setPermissions] = useState({
    preventive_schedule: true,
    managerial_reports: true,
    equipment_maintenance: false,
    maintenance_history: false,
    technical_reports: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: clients } = useClients();

  const generateAccessCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const fetchClientAccesses = async () => {
    try {
      const { data, error } = await supabase
        .from('client_access')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar nomes dos clientes separadamente
      const clientIds = data?.map(item => item.client_id) || [];
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name')
        .in('id', clientIds);

      const formattedData = data?.map(item => ({
        ...item,
        permissions: item.permissions as { 
          preventive_schedule?: boolean; 
          managerial_reports?: boolean;
          equipment_maintenance?: boolean;
          maintenance_history?: boolean;
          technical_reports?: boolean;
        },
        client_name: clientsData?.find(client => client.id === item.client_id)?.name || 'Cliente não encontrado'
      })) || [];

      setClientAccesses(formattedData);
    } catch (error) {
      console.error('Erro ao buscar acessos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os acessos de clientes.',
        variant: 'destructive',
      });
    }
  };

  React.useEffect(() => {
    if (user?.id) {
      fetchClientAccesses();
    }
  }, [user?.id]);

  const handleCreateAccess = async () => {
    if (!selectedClientId) {
      toast({
        title: 'Erro',
        description: 'Selecione um cliente.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const accessCode = generateAccessCode();
      
      const { error } = await supabase
        .from('client_access')
        .insert({
          user_id: user?.id,
          client_id: selectedClientId,
          access_code: accessCode,
          permissions: permissions,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Acesso criado com sucesso!',
      });

      fetchClientAccesses();
      setSelectedClientId('');
    } catch (error) {
      console.error('Erro ao criar acesso:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o acesso.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('client_access')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Status atualizado!',
      });

      fetchClientAccesses();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePermissions = async (id: string, newPermissions: any) => {
    try {
      const { error } = await supabase
        .from('client_access')
        .update({ permissions: newPermissions })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Permissões atualizadas!',
      });

      fetchClientAccesses();
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as permissões.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccess = async (id: string) => {
    try {
      const { error } = await supabase
        .from('client_access')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Acesso removido!',
      });

      fetchClientAccesses();
    } catch (error) {
      console.error('Erro ao remover acesso:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o acesso.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'Código copiado para a área de transferência.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Criar novo acesso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Criar Acesso para Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Cliente</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
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
            </div>
          </div>

          <div className="space-y-3">
            <Label>Permissões</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="preventive_schedule"
                  checked={permissions.preventive_schedule}
                  onCheckedChange={(checked) =>
                    setPermissions(prev => ({ ...prev, preventive_schedule: checked }))
                  }
                />
                <Label htmlFor="preventive_schedule">Cronograma Preventivo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="managerial_reports"
                  checked={permissions.managerial_reports}
                  onCheckedChange={(checked) =>
                    setPermissions(prev => ({ ...prev, managerial_reports: checked }))
                  }
                />
                <Label htmlFor="managerial_reports">Relatórios Gerenciais</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="equipment_maintenance"
                  checked={permissions.equipment_maintenance}
                  onCheckedChange={(checked) =>
                    setPermissions(prev => ({ ...prev, equipment_maintenance: checked }))
                  }
                />
                <Label htmlFor="equipment_maintenance">Manutenção de Equipamentos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenance_history"
                  checked={permissions.maintenance_history}
                  onCheckedChange={(checked) =>
                    setPermissions(prev => ({ ...prev, maintenance_history: checked }))
                  }
                />
                <Label htmlFor="maintenance_history">Histórico de Manutenções</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="technical_reports"
                  checked={permissions.technical_reports}
                  onCheckedChange={(checked) =>
                    setPermissions(prev => ({ ...prev, technical_reports: checked }))
                  }
                />
                <Label htmlFor="technical_reports">Relatórios Técnicos</Label>
              </div>
            </div>
          </div>

          <Button onClick={handleCreateAccess} disabled={isLoading}>
            {isLoading ? 'Criando...' : 'Criar Acesso'}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de acessos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Acessos de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientAccesses.map((access) => (
              <div key={access.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{access.client_name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {access.access_code}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(access.access_code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={access.is_active ? 'default' : 'secondary'}>
                      {access.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(access.id, access.is_active)}
                    >
                      {access.is_active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteAccess(access.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Permissões:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={access.permissions?.preventive_schedule || false}
                        onCheckedChange={(checked) =>
                          handleUpdatePermissions(access.id, {
                            ...access.permissions,
                            preventive_schedule: checked,
                          })
                        }
                      />
                      <Label className="text-sm">Cronograma Preventivo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={access.permissions?.managerial_reports || false}
                        onCheckedChange={(checked) =>
                          handleUpdatePermissions(access.id, {
                            ...access.permissions,
                            managerial_reports: checked,
                          })
                        }
                      />
                      <Label className="text-sm">Relatórios Gerenciais</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={access.permissions?.equipment_maintenance || false}
                        onCheckedChange={(checked) =>
                          handleUpdatePermissions(access.id, {
                            ...access.permissions,
                            equipment_maintenance: checked,
                          })
                        }
                      />
                      <Label className="text-sm">Manutenção de Equipamentos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={access.permissions?.maintenance_history || false}
                        onCheckedChange={(checked) =>
                          handleUpdatePermissions(access.id, {
                            ...access.permissions,
                            maintenance_history: checked,
                          })
                        }
                      />
                      <Label className="text-sm">Histórico de Manutenções</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={access.permissions?.technical_reports || false}
                        onCheckedChange={(checked) =>
                          handleUpdatePermissions(access.id, {
                            ...access.permissions,
                            technical_reports: checked,
                          })
                        }
                      />
                      <Label className="text-sm">Relatórios Técnicos</Label>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {clientAccesses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum acesso de cliente configurado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAccessManagement;