import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Search, Edit, Trash2, Plus, AlertCircle } from "lucide-react";
import { useServices, useDeleteService } from "@/hooks/useServices";
import { NewServiceForm } from "@/components/forms/NewServiceForm";

const ServicesContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [complexityFilter, setComplexityFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  console.log('🎯 ServicesContent rendering');

  const { data: services = [], isLoading: servicesLoading, error: servicesError } = useServices();
  const deleteService = useDeleteService();

  console.log('📊 ServicesContent - Services:', services?.length || 0, 'Loading:', servicesLoading, 'Error:', servicesError);

  const filteredServices = useMemo(() => {
    if (!Array.isArray(services)) return [];
    
    return services.filter(service => {
      if (!service) return false;
      const serviceName = service.name || '';
      const serviceDescription = service.description || '';
      
      const matchesSearch = serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           serviceDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !typeFilter || service.service_type === typeFilter;
      const matchesComplexity = !complexityFilter || service.complexity_level === complexityFilter;
      
      return matchesSearch && matchesType && matchesComplexity;
    });
  }, [services, searchTerm, typeFilter, complexityFilter]);

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      default: return 'Não definida';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'corrective': return 'Corretiva';
      case 'preventive': return 'Preventiva';
      case 'predictive': return 'Preditiva';
      default: return 'Não definido';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  console.log('🔍 Filtered services count:', filteredServices.length);

  // Always render the main container, even if there's an error
  return (
    <div className="w-full">
      {/* Header com Botão Novo Serviço - SEMPRE VISÍVEL */}
      <div className="mb-6 flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h2 className="text-2xl font-bold text-evolutec-black">Catálogo de Serviços</h2>
          <p className="text-evolutec-text">
            {Array.isArray(services) ? services.length : 0} serviços cadastrados
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-evolutec-green hover:bg-evolutec-green/90 text-white"
        >
          <Plus size={16} className="mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Container principal - SEMPRE VISÍVEL */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Formulário de Cadastro */}
        {showForm && (
          <div className="xl:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Serviço</CardTitle>
              </CardHeader>
              <CardContent>
                <NewServiceForm onSuccess={() => {
                  console.log('✅ Serviço cadastrado com sucesso');
                  setShowForm(false);
                }} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Serviços - SEMPRE VISÍVEL */}
        <div className={showForm ? "xl:col-span-1" : "xl:col-span-2"}>
          <Card className="min-h-[500px]">
            <CardHeader>
              <CardTitle>Lista de Serviços</CardTitle>
              <CardDescription>
                Gerencie seus serviços pré-orçados
              </CardDescription>
              
              {/* Filtros - SEMPRE VISÍVEIS */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Buscar serviços..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos tipos</SelectItem>
                    <SelectItem value="corrective">Corretiva</SelectItem>
                    <SelectItem value="preventive">Preventiva</SelectItem>
                    <SelectItem value="predictive">Preditiva</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={complexityFilter} onValueChange={setComplexityFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar complexidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas complexidades</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {/* Conteúdo renderizado condicionalmente MAS sempre dentro do Card */}
              {servicesError ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-medium text-red-500 mb-2">
                    Erro ao carregar serviços
                  </h3>
                  <p className="text-evolutec-text mb-4">
                    {servicesError?.message || 'Erro desconhecido'}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Verifique sua conexão ou contate o suporte
                  </p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="bg-evolutec-green hover:bg-evolutec-green/90 text-white"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              ) : servicesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-evolutec-green mx-auto"></div>
                  <p className="mt-2 text-evolutec-text">Carregando serviços...</p>
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-evolutec-black mb-2">
                    {Array.isArray(services) && services.length === 0 
                      ? 'Nenhum serviço cadastrado ainda' 
                      : 'Nenhum serviço encontrado'
                    }
                  </h3>
                  <p className="text-evolutec-text mb-4 max-w-md mx-auto">
                    {Array.isArray(services) && services.length === 0 
                      ? 'Comece cadastrando seu primeiro serviço pré-orçado clicando no botão "Novo Serviço" acima.' 
                      : 'Tente ajustar os filtros de busca para encontrar o que procura.'
                    }
                  </p>
                  {Array.isArray(services) && services.length === 0 && (
                    <Button 
                      onClick={() => setShowForm(true)}
                      className="bg-evolutec-green hover:bg-evolutec-green/90 text-white"
                    >
                      <Plus size={16} className="mr-2" />
                      Cadastrar Primeiro Serviço
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredServices.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-evolutec-black">{service.name || 'Nome não informado'}</h3>
                          {service.description && (
                            <p className="text-sm text-evolutec-text mt-1 line-clamp-2">{service.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              {getTypeLabel(service.service_type || '')}
                            </Badge>
                            <Badge className={getComplexityColor(service.complexity_level || 'medium')}>
                              {getComplexityLabel(service.complexity_level || 'medium')}
                            </Badge>
                            {service.estimated_time && (
                              <span className="text-sm text-evolutec-text">
                                {service.estimated_time}h
                              </span>
                            )}
                          </div>
                          <div className="mt-2">
                            <span className="font-semibold text-evolutec-green text-lg">
                              {formatCurrency(service.base_price || 0)}
                            </span>
                          </div>
                          {service.recommended_team && (
                            <p className="text-sm text-evolutec-text mt-1">
                              Equipe: {service.recommended_team}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteService.mutate(service.id)}
                            disabled={deleteService.isPending}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ServicesContent;
