
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FileText, Search, Filter, Plus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormModal from "@/components/modals/FormModal";
import NewReportForm from "@/components/forms/NewReportForm";
import FilterModal from "@/components/filters/FilterModal";
import ManagerialReport from "@/components/reports/ManagerialReport";
import ReportActions from "@/components/reports/ReportActions";
import { useSecureReportsByClient } from "@/hooks/useSecureReportsByClient";
import { sanitizeSearchTerm } from "@/lib/validation";
import { toast } from "sonner";
import { useClientContext } from "@/contexts/ClientContext";
import ClientSelector from "@/components/dashboard/ClientSelector";
import ClientHeader from "@/components/dashboard/ClientHeader";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const Reports = () => {
  const { selectedClientId } = useClientContext();
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [isEditReportModalOpen, setIsEditReportModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<any>({});
  
  const { data: reports, isLoading, refetch } = useSecureReportsByClient(selectedClientId);

  // Se nenhum cliente foi selecionado, mostra o seletor
  if (!selectedClientId) {
    return <ClientSelector />;
  }

  const handleNewReportSuccess = () => {
    setIsNewReportModalOpen(false);
    // Força refresh da query de relatórios ao invés de recarregar a página
    refetch();
  };

  const handleEditReportSuccess = () => {
    setIsEditReportModalOpen(false);
    setEditingReport(null);
    toast.success('Relatório atualizado com sucesso!');
  };

  const handleCloseEditModal = () => {
    setIsEditReportModalOpen(false);
    setEditingReport(null);
  };

  const handleDeleteReport = async (id: string) => {
    try {
      const { error } = await supabase.from('reports').delete().eq('id', id);
      if (error) throw error;
      toast.success('Relatório excluído com sucesso!');
      refetch();
    } catch (err) {
      console.error('Erro ao excluir relatório:', err);
      toast.error('Não foi possível excluir o relatório.');
    }
  };

  const handleView = (report: any) => {
    console.log('Visualizando relatório:', report);
    toast.success(`Visualizando relatório: ${report.title}`);
    // TODO: Implementar modal de visualização detalhada
  };

  const handleEdit = (report: any) => {
    console.log('Editando relatório:', report);
    setEditingReport(report);
    setIsEditReportModalOpen(true);
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

  // Filtrar relatórios
  const filteredReports = reports?.filter(report => {
    // Filtro de busca
    if (searchTerm && !report.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !report.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filtros específicos
    if (filters.dateFrom && new Date(report.report_date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(report.report_date) > new Date(filters.dateTo)) return false;

    return true;
  });

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <ClientHeader />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
              <p className="text-muted-foreground mt-2">
                Análises e relatórios do sistema de manutenção
              </p>
            </div>
            <Button 
              onClick={() => setIsNewReportModalOpen(true)}
            >
              <FileText size={16} className="mr-2" />
              Novo Relatório
            </Button>
          </div>

          <Tabs defaultValue="user-reports" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user-reports" className="flex items-center space-x-2">
                <FileText size={16} />
                <span>Meus Relatórios</span>
              </TabsTrigger>
              <TabsTrigger value="managerial" className="flex items-center space-x-2">
                <BarChart3 size={16} />
                <span>Relatório Gerencial</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="user-reports" className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-evolutec-text" />
                  <input
                    type="text"
                    placeholder="Buscar relatórios..."
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

              {/* Relatórios Criados pelo Usuário */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-evolutec-black mb-4">Meus Relatórios</h2>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-evolutec-text">Carregando relatórios...</p>
                  </div>
                ) : filteredReports && filteredReports.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map((report: any) => (
                      <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-evolutec-green rounded-lg flex items-center justify-center">
                              <FileText size={20} className="text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-evolutec-black">{report.title}</h3>
                              <p className="text-sm text-evolutec-text">
                                {new Date(report.report_date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm mb-4">
                          {report.equipments && (
                            <p className="text-evolutec-text">Equipamento: {report.equipments.name}</p>
                          )}
                          {report.technicians && (
                            <p className="text-evolutec-text">Técnico: {report.technicians.name}</p>
                          )}
                          {report.description && (
                            <p className="text-evolutec-text">Descrição: {report.description}</p>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div className="text-sm text-evolutec-text">
                            Criado em: {new Date(report.created_at).toLocaleDateString('pt-BR')}
                          </div>
                          
                          <ReportActions
                            report={report}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={() => handleDeleteReport(report.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-evolutec-text mb-4">
                      {searchTerm || Object.keys(filters).length > 0 
                        ? 'Nenhum relatório encontrado com os filtros aplicados' 
                        : 'Nenhum relatório disponível. Crie um novo relatório para começar.'}
                    </p>
                    <Button 
                      className="evolutec-btn"
                      onClick={() => setIsNewReportModalOpen(true)}
                    >
                      <Plus size={16} className="mr-2" />
                      Criar Primeiro Relatório
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="managerial">
              <ManagerialReport />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>

      <FormModal
        isOpen={isNewReportModalOpen}
        onClose={() => setIsNewReportModalOpen(false)}
        title="Novo Relatório"
      >
        <NewReportForm onSuccess={handleNewReportSuccess} />
      </FormModal>

      <FormModal
        isOpen={isEditReportModalOpen}
        onClose={handleCloseEditModal}
        title="Editar Relatório"
      >
        <NewReportForm 
          onSuccess={handleEditReportSuccess}
          initialData={editingReport}
        />
      </FormModal>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        type="reports"
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
    </ProtectedRoute>
  );
};

export default Reports;
