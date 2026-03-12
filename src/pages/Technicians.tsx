
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { User, Plus, Search, Filter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import FormModal from "@/components/modals/FormModal";
import NewTechnicianForm from "@/components/forms/NewTechnicianForm";
import FilterModal from "@/components/filters/FilterModal";
import { useSecureTechnicians, useDeleteSecureTechnician } from "@/hooks/useSecureTechnicians";
import { sanitizeSearchTerm } from "@/lib/validation";
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

const Technicians = () => {
  const [isNewTechnicianModalOpen, setIsNewTechnicianModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<any>({});
  
  const { data: technicians, isLoading } = useSecureTechnicians();
  const deleteTechnicianMutation = useDeleteSecureTechnician();

  const handleNewTechnicianSuccess = () => {
    setIsNewTechnicianModalOpen(false);
  };

  const handleDeleteTechnician = (id: string) => {
    deleteTechnicianMutation.mutate(id);
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeSearchTerm(e.target.value);
    setSearchTerm(sanitized);
  };

  // Filtrar técnicos
  const filteredTechnicians = technicians?.filter(tech => {
    // Filtro de busca
    if (searchTerm && !tech.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !tech.email?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filtros específicos
    if (filters.status && tech.status !== filters.status) return false;
    if (filters.specialization && tech.specialization !== filters.specialization) return false;
    if (filters.name && !tech.name.toLowerCase().includes(filters.name.toLowerCase())) return false;

    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-blue-100 text-blue-800';
      case 'vacation': return 'bg-purple-100 text-purple-800';
      case 'sick': return 'bg-orange-100 text-orange-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'busy': return 'Em Serviço';
      case 'vacation': return 'Férias';
      case 'sick': return 'Licença Médica';
      case 'inactive': return 'Inativo';
      default: return status;
    }
  };

  const getSpecializationText = (spec: string) => {
    switch (spec) {
      case 'mechanical': return 'Mecânica';
      case 'electrical': return 'Elétrica';
      case 'hydraulic': return 'Hidráulica';
      case 'automation': return 'Automação';
      case 'welding': return 'Soldagem';
      case 'instrumentation': return 'Instrumentação';
      case 'general': return 'Geral';
      default: return spec || 'Geral';
    }
  };

  return (
    <>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-evolutec-black">Técnicos</h1>
              <p className="text-evolutec-text mt-2">
                Gerencie equipe de técnicos e especialistas
              </p>
            </div>
            <Button 
              className="evolutec-btn"
              onClick={() => setIsNewTechnicianModalOpen(true)}
            >
              <Plus size={16} className="mr-2" />
              Novo Técnico
            </Button>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-evolutec-text" />
              <input
                type="text"
                placeholder="Buscar técnicos..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-evolutec-green focus:border-transparent"
                maxLength={100}
              />
            </div>
            <Button variant="outline" onClick={() => setIsFilterModalOpen(true)}>
              <Filter size={16} className="mr-2" />
              Filtros
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-evolutec-text">Carregando técnicos...</p>
              </div>
            ) : filteredTechnicians && filteredTechnicians.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTechnicians.map((tech) => (
                  <div key={tech.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-evolutec-green rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {tech.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-evolutec-black">{tech.name}</h3>
                        <p className="text-sm text-evolutec-text">{getSpecializationText(tech.specialization || '')}</p>
                      </div>
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
                              Tem certeza que deseja excluir o técnico "{tech.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTechnician(tech.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-evolutec-text">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(tech.status)}`}>
                          {getStatusText(tech.status)}
                        </span>
                      </div>
                      {tech.phone && (
                        <div className="flex justify-between">
                          <span className="text-sm text-evolutec-text">Telefone:</span>
                          <span className="text-sm text-evolutec-black">{tech.phone}</span>
                        </div>
                      )}
                      {tech.email && (
                        <div className="flex justify-between">
                          <span className="text-sm text-evolutec-text">E-mail:</span>
                          <span className="text-sm text-evolutec-black">{tech.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-evolutec-text mb-4">
                  {searchTerm || Object.keys(filters).length > 0 
                    ? 'Nenhum técnico encontrado com os filtros aplicados' 
                    : 'Nenhum técnico cadastrado ainda'}
                </p>
                <Button 
                  className="evolutec-btn"
                  onClick={() => setIsNewTechnicianModalOpen(true)}
                >
                  <Plus size={16} className="mr-2" />
                  Cadastrar Primeiro Técnico
                </Button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>

      <FormModal
        isOpen={isNewTechnicianModalOpen}
        onClose={() => setIsNewTechnicianModalOpen(false)}
        title="Novo Técnico"
      >
        <NewTechnicianForm onSuccess={handleNewTechnicianSuccess} />
      </FormModal>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        type="technicians"
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </>
  );
};

export default Technicians;
