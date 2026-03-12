import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useClientEquipments } from '@/hooks/useClientEquipments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Building2, MapPin, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ClientServiceCallEquipmentList = () => {
  const { clientData } = useClientAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data: equipments, isLoading } = useClientEquipments(clientData?.clientId);

  // Filtrar equipamentos pelo termo de busca
  const filteredEquipments = equipments?.filter(equipment => 
    equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipment.installation_location?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEquipmentSelect = (equipmentId: string) => {
    navigate(`/client-service-call/form/${equipmentId}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/client-service-call')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Selecionar Equipamento
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Seus Equipamentos
          </h2>
          <p className="text-muted-foreground mb-4">
            Selecione o equipamento que apresenta problema
          </p>

          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredEquipments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchTerm ? 'Nenhum equipamento encontrado' : 'Nenhum equipamento disponível'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'Tente buscar com outros termos'
                    : 'Entre em contato com a equipe para verificar seus equipamentos'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEquipments.map((equipment) => (
              <Card 
                key={equipment.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleEquipmentSelect(equipment.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-primary" />
                        {equipment.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {equipment.installation_location || 'Local não especificado'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge 
                        variant={equipment.status === 'operational' ? 'default' : 'secondary'}
                      >
                        {equipment.status === 'operational' ? 'Operacional' : 'Em Manutenção'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {equipment.brand && (
                      <div>
                        <span className="font-medium">Marca:</span>
                        <p className="text-muted-foreground">{equipment.brand}</p>
                      </div>
                    )}
                    {equipment.model && (
                      <div>
                        <span className="font-medium">Modelo:</span>
                        <p className="text-muted-foreground">{equipment.model}</p>
                      </div>
                    )}
                    {equipment.serial_number && (
                      <div>
                        <span className="font-medium">Série:</span>
                        <p className="text-muted-foreground">{equipment.serial_number}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEquipmentSelect(equipment.id);
                      }}
                    >
                      Abrir Chamado para este Equipamento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientServiceCallEquipmentList;