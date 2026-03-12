import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, LayoutDashboard } from 'lucide-react';
import { useSecureClients } from '@/hooks/useSecureClients';
import { useClientContext } from '@/contexts/ClientContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const ClientSelector: React.FC = () => {
  const { data: clients, isLoading } = useSecureClients();
  const { setSelectedClient, setAllClients } = useClientContext();
  const navigate = useNavigate();

  const handleSelectClient = (clientId: string, clientName: string) => {
    setSelectedClient(clientId, clientName);
  };

  const handleSelectAllClients = () => {
    setAllClients();
  };

  const handleEnterWithoutClient = () => {
    setAllClients(); // Set como "todos os clientes" para permitir acesso
    navigate('/dashboard');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Selecione um Cliente
          </CardTitle>
          <p className="text-muted-foreground">
            Escolha o cliente para acessar suas informações específicas
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Opção de Acesso sem Cliente */}
            <Card 
              className="hover:bg-accent transition-colors cursor-pointer border-2 hover:border-secondary bg-gradient-to-r from-secondary/5 to-primary/5"
              onClick={handleEnterWithoutClient}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-secondary/20 p-3 rounded-full">
                    <LayoutDashboard className="h-8 w-8 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground">
                      Entrar sem Cliente
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Acesse a dashboard para começar a usar o sistema
                    </p>
                  </div>
                </div>
                <Button 
                  variant="secondary"
                  className="w-full mt-4"
                  onClick={handleEnterWithoutClient}
                >
                  Entrar na Dashboard
                </Button>
              </CardContent>
            </Card>

            {!clients || clients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nenhum cliente cadastrado encontrado
                </p>
                <p className="text-sm text-muted-foreground">
                  Você pode começar cadastrando seus primeiros clientes
                </p>
              </div>
            ) : (
            <div className="space-y-4">
              {/* Opção Todos os Clientes */}
              <Card 
                className="hover:bg-accent transition-colors cursor-pointer border-2 hover:border-primary bg-gradient-to-r from-primary/5 to-secondary/5"
                onClick={handleSelectAllClients}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/20 p-3 rounded-full">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground">
                        Todos os Clientes
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Visualizar dados agregados de todos os clientes
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4"
                    onClick={handleSelectAllClients}
                  >
                    Selecionar Todos
                  </Button>
                </CardContent>
              </Card>

              {/* Lista de Clientes Individuais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((client) => (
                <Card 
                  key={client.id} 
                  className="hover:bg-accent transition-colors cursor-pointer border-2 hover:border-primary"
                  onClick={() => handleSelectClient(client.id, client.name)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {client.name}
                        </h3>
                        {client.contact_person && (
                          <p className="text-sm text-muted-foreground truncate">
                            {client.contact_person}
                          </p>
                        )}
                        {client.city && (
                          <p className="text-xs text-muted-foreground truncate">
                            {client.city}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-4"
                      onClick={() => handleSelectClient(client.id, client.name)}
                    >
                      Selecionar
                    </Button>
                  </CardContent>
                </Card>
                ))}
              </div>
            </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSelector;