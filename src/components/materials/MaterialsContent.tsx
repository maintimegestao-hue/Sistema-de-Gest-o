import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Search, Edit, Trash2, Plus, AlertCircle } from "lucide-react";
import { useMaterials, useDeleteMaterial } from "@/hooks/useMaterials";
import { NewMaterialForm } from "@/components/forms/NewMaterialForm";

const MaterialsContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  console.log('🎯 MaterialsContent component rendering');

  const { data: materials = [], isLoading: materialsLoading, error: materialsError } = useMaterials();
  const deleteMaterial = useDeleteMaterial();

  console.log('📊 Materials data:', { 
    count: materials?.length || 0, 
    loading: materialsLoading, 
    hasError: !!materialsError 
  });

  const filteredMaterials = useMemo(() => {
    if (!Array.isArray(materials)) return [];
    
    return materials.filter(material => {
      if (!material) return false;
      const materialName = material.name || '';
      const materialCode = material.internal_code || '';
      const materialBrand = material.brand || '';
      
      const matchesSearch = materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           materialBrand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || material.category === categoryFilter;
      const matchesLocation = !locationFilter || material.physical_location === locationFilter;
      
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [materials, searchTerm, categoryFilter, locationFilter]);

  const getStockColor = (quantity: number) => {
    if (quantity === 0) return 'bg-red-100 text-red-800';
    if (quantity <= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  // Always render the main container, even if there's an error
  return (
    <div className="w-full">
      {/* Header com Botão Novo Material - SEMPRE VISÍVEL */}
      <div className="mb-6 flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h2 className="text-2xl font-bold text-evolutec-black">Catálogo de Materiais</h2>
          <p className="text-evolutec-text">
            {Array.isArray(materials) ? materials.length : 0} materiais cadastrados
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-evolutec-green hover:bg-evolutec-green/90 text-white"
        >
          <Plus size={16} className="mr-2" />
          Novo Material
        </Button>
      </div>

      {/* Container principal - SEMPRE VISÍVEL */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Formulário de Cadastro */}
        {showForm && (
          <div className="xl:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Material</CardTitle>
              </CardHeader>
              <CardContent>
                <NewMaterialForm onSuccess={() => {
                  console.log('✅ Material cadastrado com sucesso');
                  setShowForm(false);
                }} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Materiais - SEMPRE VISÍVEL */}
        <div className={showForm ? "xl:col-span-1" : "xl:col-span-2"}>
          <Card className="min-h-[500px]">
            <CardHeader>
              <CardTitle>Lista de Materiais</CardTitle>
              <CardDescription>
                Gerencie seu estoque de materiais
              </CardDescription>
              
              {/* Filtros - SEMPRE VISÍVEIS */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Buscar materiais..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas categorias</SelectItem>
                    <SelectItem value="parafusos">Parafusos e Fixadores</SelectItem>
                    <SelectItem value="eletrica">Material Elétrico</SelectItem>
                    <SelectItem value="hidraulica">Material Hidráulico</SelectItem>
                    <SelectItem value="lubrificantes">Lubrificantes</SelectItem>
                    <SelectItem value="ferramentas">Ferramentas</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar localização" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas localizações</SelectItem>
                    <SelectItem value="almoxarifado">Almoxarifado</SelectItem>
                    <SelectItem value="caminhao">Caminhão</SelectItem>
                    <SelectItem value="obra">Obra</SelectItem>
                    <SelectItem value="deposito">Depósito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {/* Conteúdo renderizado condicionalmente MAS sempre dentro do Card */}
              {materialsError ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-medium text-red-500 mb-2">
                    Erro ao carregar materiais
                  </h3>
                  <p className="text-evolutec-text mb-4">
                    {materialsError?.message || 'Erro desconhecido'}
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
              ) : materialsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-evolutec-green mx-auto"></div>
                  <p className="mt-2 text-evolutec-text">Carregando materiais...</p>
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-evolutec-black mb-2">
                    {Array.isArray(materials) && materials.length === 0 
                      ? 'Nenhum material cadastrado ainda' 
                      : 'Nenhum material encontrado'
                    }
                  </h3>
                  <p className="text-evolutec-text mb-4 max-w-md mx-auto">
                    {Array.isArray(materials) && materials.length === 0 
                      ? 'Comece cadastrando seu primeiro material clicando no botão "Novo Material" acima.' 
                      : 'Tente ajustar os filtros de busca para encontrar o que procura.'
                    }
                  </p>
                  {Array.isArray(materials) && materials.length === 0 && (
                    <Button 
                      onClick={() => setShowForm(true)}
                      className="bg-evolutec-green hover:bg-evolutec-green/90 text-white"
                    >
                      <Plus size={16} className="mr-2" />
                      Cadastrar Primeiro Material
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredMaterials.map((material) => (
                    <div key={material.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-evolutec-black">{material.name || 'Nome não informado'}</h3>
                          {material.internal_code && (
                            <p className="text-sm text-evolutec-text">Código: {material.internal_code}</p>
                          )}
                          {material.brand && (
                            <p className="text-sm text-evolutec-text">Marca: {material.brand}</p>
                          )}
                          {material.physical_location && (
                            <p className="text-sm text-evolutec-text">Local: {material.physical_location}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getStockColor(material.stock_quantity || 0)}>
                              Estoque: {material.stock_quantity || 0} {material.unit_of_measure || 'un'}
                            </Badge>
                            <span className="font-semibold text-evolutec-green">
                              {formatCurrency(material.unit_price || 0)}
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
                            onClick={() => deleteMaterial.mutate(material.id)}
                            disabled={deleteMaterial.isPending}
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

export default MaterialsContent;
