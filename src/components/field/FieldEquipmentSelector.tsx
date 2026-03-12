import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Wrench, Building } from 'lucide-react';
import { useFieldEquipments } from '@/hooks/useFieldEquipments';
import { useFieldClients } from '@/hooks/useFieldClients';


interface FieldEquipmentSelectorProps {
  onBack: () => void;
  onEquipmentSelect: (equipment: any) => void;
}

const FieldEquipmentSelector: React.FC<FieldEquipmentSelectorProps> = ({ onBack, onEquipmentSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  
  const { data: equipments, isLoading: equipmentsLoading } = useFieldEquipments(selectedClient);
  const { data: clients, isLoading: clientsLoading } = useFieldClients();

  const filteredEquipments = useMemo(() => {
    if (!equipments || !Array.isArray(equipments)) return [];
    
    return equipments.filter(equipment => {
      const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.installation_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClient = selectedClient === 'all' || equipment.client_id === selectedClient;
      
      return matchesSearch && matchesClient;
    });
  }, [equipments, searchTerm, selectedClient]);

  // Encontrar o nome do cliente para cada equipamento
  const getClientName = (clientId: string) => {
    if (!clients || !Array.isArray(clients)) return 'Cliente não identificado';
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Cliente não identificado';
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold">Selecionar Equipamento</h2>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          {/* Filtro por Cliente */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building className="w-4 h-4" />
              Filtrar por Cliente
            </label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Clientes</SelectItem>
                {clients && Array.isArray(clients) && clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Busca por equipamento */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, localização ou série..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {equipmentsLoading || clientsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando equipamentos...</p>
            </div>
          ) : filteredEquipments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || selectedClient !== 'all' 
                  ? 'Nenhum equipamento encontrado com os filtros aplicados.' 
                  : 'Todos os equipamentos já tiveram manutenção realizada neste mês ou não há equipamentos disponíveis.'}
              </p>
              {(searchTerm || selectedClient !== 'all') && (
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedClient('all');
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEquipments.map((equipment) => (
                <Card
                  key={equipment.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onEquipmentSelect(equipment)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{equipment.name}</h3>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {getClientName(equipment.client_id)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            📍 {equipment.installation_location || 'Local não informado'}
                          </p>
                          {equipment.serial_number && (
                            <p className="text-xs text-muted-foreground">
                              S/N: {equipment.serial_number}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={equipment.status === 'operational' ? 'default' : 'secondary'}>
                          {equipment.status === 'operational' ? 'Operacional' : equipment.status}
                        </Badge>
                        <Wrench className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldEquipmentSelector;