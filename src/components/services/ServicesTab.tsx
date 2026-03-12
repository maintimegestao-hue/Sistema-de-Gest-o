
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Search, Edit, Trash2, Plus, AlertCircle } from "lucide-react";
import { useServices, useDeleteService } from "@/hooks/useServices";

const ServicesTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  console.log('🎯 ServicesTab rendering - showForm:', showForm);

  const { data: services = [], isLoading: servicesLoading, error: servicesError } = useServices();
  const deleteService = useDeleteService();

  console.log('📊 ServicesTab - Services:', services?.length || 0, 'Loading:', servicesLoading, 'Error:', servicesError);

  const handleNewService = () => {
    console.log('🔄 Abrindo formulário de serviço');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    console.log('🔄 Fechando formulário de serviço');
    setShowForm(false);
  };

  if (servicesError) {
    console.error('❌ Services error:', servicesError);
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-500 mb-2">
          Erro ao carregar serviços
        </h3>
        <p className="text-evolutec-text mb-4">
          {servicesError?.message || 'Erro desconhecido'}
        </p>
        <p className="text-sm text-gray-600">
          Verifique sua conexão ou contate o suporte
        </p>
      </div>
    );
  }

  const filteredServices = Array.isArray(services) ? services.filter(service => {
    if (!service) return false;
    const serviceName = service.name || '';
    const serviceDescription = service.description || '';
    
    const matchesSearch = serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         serviceDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || service.service_type === categoryFilter;
    return matchesSearch && matchesCategory;
  }) : [];

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  console.log('🔍 Filtered services count:', filteredServices.length);
  console.log('🎨 Renderizando formulário? showForm =', showForm);

  return (
    <div className="space-y-6">
      {/* Botão para mostrar formulário */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-evolutec-black">Serviços</h2>
        <Button 
          onClick={handleNewService}
          className="bg-evolutec-green hover:bg-evolutec-green/90 text-white"
        >
          <Plus size={16} className="mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Formulário de Cadastro de Serviço Simplificado */}
      {showForm && (
        <Card className="border-2 border-evolutec-green">
          <CardHeader className="bg-evolutec-green/5">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-evolutec-green">Cadastrar Serviço</CardTitle>
                <CardDescription>
                  Adicione um novo serviço ao seu catálogo
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCloseForm}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕ Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Serviço *</label>
                <Input placeholder="Ex: Lubrificação de Equipamentos" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Serviço</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corrective">Corretiva</SelectItem>
                    <SelectItem value="preventive">Preventiva</SelectItem>
                    <SelectItem value="predictive">Preditiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Descrição</label>
                <Input placeholder="Descreva o serviço..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nível de Complexidade</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione complexidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tempo Estimado (horas)</label>
                <Input type="number" step="0.5" placeholder="Ex: 2.5" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço Base (R$)</label>
                <Input type="number" step="0.01" placeholder="0,00" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleCloseForm}>
                Cancelar
              </Button>
              <Button 
                className="bg-evolutec-green hover:bg-evolutec-green/90 text-white"
                onClick={() => {
                  // Aqui seria a chamada para salvar
                  handleCloseForm();
                }}
              >
                Salvar Serviço
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Catálogo de Serviços */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Catálogo de Serviços</CardTitle>
              <CardDescription>
                {Array.isArray(services) ? services.length : 0} serviços cadastrados
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
          </div>
        </CardHeader>
        <CardContent>
          {servicesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-evolutec-green mx-auto"></div>
              <p className="mt-2 text-evolutec-text">Carregando serviços...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-evolutec-black mb-2">
                {Array.isArray(services) && services.length === 0 
                  ? 'Nenhum serviço cadastrado ainda' 
                  : 'Nenhum serviço encontrado'
                }
              </h3>
              <p className="text-evolutec-text mb-4">
                {Array.isArray(services) && services.length === 0 
                  ? 'Comece cadastrando seu primeiro serviço clicando no botão "Novo Serviço" acima.' 
                  : 'Tente ajustar os filtros de busca.'
                }
              </p>
              {Array.isArray(services) && services.length === 0 && (
                <Button 
                  onClick={handleNewService}
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
                        <p className="text-sm text-evolutec-text mt-1">{service.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          {service.service_type === 'corrective' ? 'Corretiva' : 
                           service.service_type === 'preventive' ? 'Preventiva' : 'Preditiva'}
                        </Badge>
                        <Badge className={getComplexityColor(service.complexity_level || 'medium')}>
                          {service.complexity_level === 'low' ? 'Baixa' :
                           service.complexity_level === 'medium' ? 'Média' : 'Alta'}
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
  );
};

export default ServicesTab;
