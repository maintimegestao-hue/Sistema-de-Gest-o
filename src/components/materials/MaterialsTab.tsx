
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Search, Edit, Trash2, Plus, AlertCircle } from "lucide-react";
import { useMaterials, useDeleteMaterial } from "@/hooks/useMaterials";

const MaterialsTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  console.log('🎯 MaterialsTab rendering - showForm:', showForm);

  const { data: materials = [], isLoading: materialsLoading, error: materialsError } = useMaterials();
  const deleteMaterial = useDeleteMaterial();

  console.log('📊 MaterialsTab - Materials:', materials?.length || 0, 'Loading:', materialsLoading, 'Error:', materialsError);

  const handleNewMaterial = () => {
    console.log('🔄 Abrindo formulário de material');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    console.log('🔄 Fechando formulário de material');
    setShowForm(false);
  };

  if (materialsError) {
    console.error('❌ Materials error:', materialsError);
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-500 mb-2">
          Erro ao carregar materiais
        </h3>
        <p className="text-evolutec-text mb-4">
          {materialsError?.message || 'Erro desconhecido'}
        </p>
        <p className="text-sm text-gray-600">
          Verifique sua conexão ou contate o suporte
        </p>
      </div>
    );
  }

  const filteredMaterials = Array.isArray(materials) ? materials.filter(material => {
    if (!material) return false;
    const materialName = material.name || '';
    const materialCode = material.internal_code || '';
    const materialBrand = material.brand || '';
    
    const matchesSearch = materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         materialBrand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || material.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) : [];

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

  console.log('🔍 Filtered materials count:', filteredMaterials.length);
  console.log('🎨 Renderizando formulário? showForm =', showForm);

  return (
    <div className="space-y-6">
      {/* Botão para mostrar formulário */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-evolutec-black">Materiais</h2>
        <Button 
          onClick={handleNewMaterial}
          className="bg-evolutec-green hover:bg-evolutec-green/90 text-white"
        >
          <Plus size={16} className="mr-2" />
          Novo Material
        </Button>
      </div>

      {/* Formulário de Cadastro de Material Simplificado */}
      {showForm && (
        <Card className="border-2 border-evolutec-green">
          <CardHeader className="bg-evolutec-green/5">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-evolutec-green">Cadastrar Material</CardTitle>
                <CardDescription>
                  Adicione um novo material ao seu catálogo
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
                <label className="text-sm font-medium">Nome do Material *</label>
                <Input placeholder="Ex: Parafuso M8" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Código Interno</label>
                <Input placeholder="Ex: PAR-M8-001" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parafusos">Parafusos e Fixadores</SelectItem>
                    <SelectItem value="eletrica">Material Elétrico</SelectItem>
                    <SelectItem value="hidraulica">Material Hidráulico</SelectItem>
                    <SelectItem value="lubrificantes">Lubrificantes</SelectItem>
                    <SelectItem value="ferramentas">Ferramentas</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Marca</label>
                <Input placeholder="Ex: Tramontina" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unidade de Medida</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="un">Unidade</SelectItem>
                    <SelectItem value="kg">Quilograma</SelectItem>
                    <SelectItem value="l">Litro</SelectItem>
                    <SelectItem value="m">Metro</SelectItem>
                    <SelectItem value="m2">Metro²</SelectItem>
                    <SelectItem value="m3">Metro³</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantidade em Estoque</label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço Unitário (R$)</label>
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
                Salvar Material
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Catálogo de Materiais */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Catálogo de Materiais</CardTitle>
              <CardDescription>
                {Array.isArray(materials) ? materials.length : 0} materiais cadastrados
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
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
          </div>
        </CardHeader>
        <CardContent>
          {materialsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-evolutec-green mx-auto"></div>
              <p className="mt-2 text-evolutec-text">Carregando materiais...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-evolutec-black mb-2">
                {Array.isArray(materials) && materials.length === 0 
                  ? 'Nenhum material cadastrado ainda' 
                  : 'Nenhum material encontrado'
                }
              </h3>
              <p className="text-evolutec-text mb-4">
                {Array.isArray(materials) && materials.length === 0 
                  ? 'Comece cadastrando seu primeiro material clicando no botão "Novo Material" acima.' 
                  : 'Tente ajustar os filtros de busca.'
                }
              </p>
              {Array.isArray(materials) && materials.length === 0 && (
                <Button 
                  onClick={handleNewMaterial}
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
  );
};

export default MaterialsTab;
