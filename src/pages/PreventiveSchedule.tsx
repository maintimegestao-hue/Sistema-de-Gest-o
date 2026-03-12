
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Download, Filter } from "lucide-react";
import { usePreventiveSchedule, useGeneratePreventiveSchedule } from "@/hooks/usePreventiveSchedule";
import { usePreventiveSchedulePDF } from "@/hooks/usePreventiveSchedulePDF";
import { usePreventiveSchedulePDFCustomizable } from "@/hooks/usePreventiveSchedulePDFCustomizable";
import PDFCustomizationModal, { PDFCustomizationOptions } from "@/components/pdf/PDFCustomizationModal";
import PreventiveScheduleMatrixView from "@/components/preventive-schedule/PreventiveScheduleMatrixView";
import { useSecureClients } from "@/hooks/useSecureClients";
import { useSecureEquipments } from "@/hooks/useSecureEquipments";
import { useMonthlyStatusReset } from "@/hooks/useMonthlyStatusReset";
import PreventiveScheduleTable from "@/components/preventive-schedule/PreventiveScheduleTable";
import PreventiveScheduleFilters from "@/components/preventive-schedule/PreventiveScheduleFilters";
import DashboardPreventiveSchedule from "@/components/dashboard/DashboardPreventiveSchedule";
import ClientSelector from "@/components/dashboard/ClientSelector";
import ClientHeader from "@/components/dashboard/ClientHeader";
import { useClientContext } from "@/contexts/ClientContext";
import { toast } from "sonner";

const PreventiveSchedule = () => {
  const { selectedClientId, isAllClients } = useClientContext();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showFilters, setShowFilters] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [viewType, setViewType] = useState<'table' | 'matrix'>('matrix');
  const [filters, setFilters] = useState({
    client: '',
    location: '',
    periodicity: '',
    status: ''
  });

  // Usar useMemo para evitar recálculos desnecessários
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const years = useMemo(() => Array.from({ length: 5 }, (_, i) => currentYear - 2 + i), [currentYear]);

  // Hooks com verificações de segurança
  const { data: scheduleData, isLoading, refetch } = usePreventiveSchedule(selectedYear);
  const { data: clients } = useSecureClients();
  const { data: allEquipments } = useSecureEquipments();
  const generateSchedule = useGeneratePreventiveSchedule();
  const { exportToPDF } = usePreventiveSchedulePDF();
  const { exportToPDF: exportCustomPDF } = usePreventiveSchedulePDFCustomizable();
  
  // Usar o hook de reset automático com verificação
  useMonthlyStatusReset();

  // Filtrar dados para equipamentos ativos com useMemo
  const activeScheduleData = useMemo(() => {
    if (!scheduleData) return [];
    return scheduleData.filter(
      item => ['operational', 'active', 'maintenance'].includes(item.equipment?.status || '')
    );
  }, [scheduleData]);

  const handleGenerateSchedule = () => {
    try {
      generateSchedule.mutate(selectedYear);
    } catch (error) {
      console.error('Erro ao gerar cronograma:', error);
      toast.error('Erro ao gerar cronograma. Tente novamente.');
    }
  };

  const handleExportPDF = () => {
    setShowPDFModal(true);
  };

  const handleDownloadOriginalPDF = () => {
    try {
      if (!scheduleData || scheduleData.length === 0) {
        toast.error('❌ Nenhum dado disponível para exportar');
        return;
      }

      if (!activeScheduleData || activeScheduleData.length === 0) {
        toast.error('❌ Nenhum equipamento ativo encontrado para exportar');
        return;
      }

      exportToPDF(activeScheduleData, selectedYear, filters);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('❌ Erro ao exportar PDF. Tente novamente mais tarde.');
    }
  };

  const handleDownloadCustomizedPDF = (options: PDFCustomizationOptions) => {
    try {
      if (!scheduleData || scheduleData.length === 0) {
        toast.error('❌ Nenhum dado disponível para exportar');
        return;
      }

      if (!activeScheduleData || activeScheduleData.length === 0) {
        toast.error('❌ Nenhum equipamento ativo encontrado para exportar');
        return;
      }

      const client = clients?.find(c => c.id === selectedClientId);
      const clientName = client?.name || 'Todos os Clientes';

      exportCustomPDF(activeScheduleData, selectedYear, clientName, options);
      setShowPDFModal(false);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('❌ Erro ao exportar PDF. Tente novamente mais tarde.');
    }
  };

  const handlePreviewPDF = async (options: PDFCustomizationOptions): Promise<string> => {
    try {
      if (!scheduleData || scheduleData.length === 0) return '';
      
      if (!activeScheduleData || activeScheduleData.length === 0) return '';
      
      const client = clients?.find(c => c.id === selectedClientId);
      const clientName = client?.name || 'Todos os Clientes';

      return await exportCustomPDF(activeScheduleData, selectedYear, clientName, options, true) as string;
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      return '';
    }
  };

  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      client: '',
      location: '',
      periodicity: '',
      status: ''
    });
  };

  // Se nenhum cliente foi selecionado, mostra a tabela de seleção de clientes
  if (!selectedClientId) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-evolutec-black">
                Cronograma Preventivo
              </h1>
              <p className="text-evolutec-text mt-2">
                Selecione um cliente para visualizar o cronograma preventivo
              </p>
            </div>
          </div>
          <PreventiveScheduleTable />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ClientHeader />
        
        {/* Cronograma Preventivo Anual */}
        <DashboardPreventiveSchedule />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-evolutec-black">
              Cronograma Preventivo Anual
            </h1>
            <p className="text-evolutec-text mt-2">
              Visualize e gerencie as manutenções preventivas de todos os equipamentos ativos
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Toggle de visualização */}
            <div className="flex rounded-lg border p-1">
              <Button
                variant={viewType === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('table')}
              >
                Tabela
              </Button>
              <Button
                variant={viewType === 'matrix' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('matrix')}
              >
                Matriz
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              Filtros
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={!activeScheduleData || activeScheduleData.length === 0 || isLoading}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Exportar PDF
            </Button>
            
            <Button
              onClick={handleGenerateSchedule}
              disabled={generateSchedule.isPending}
              className="evolutec-btn flex items-center gap-2"
            >
              <RefreshCw size={16} className={generateSchedule.isPending ? 'animate-spin' : ''} />
              {generateSchedule.isPending ? 'Gerando...' : 'Gerar Cronograma'}
            </Button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <PreventiveScheduleFilters
                filters={filters}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
              />
            </CardContent>
          </Card>
        )}

        {/* Informações importantes */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-sm text-blue-800">
              <strong>Informações importantes:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Apenas equipamentos ativos são exibidos no cronograma</li>
                <li>As células são preenchidas conforme a periodicidade configurada: M (Mensal), B (Bimestral), T (Trimestral), S (Semestral), A (Anual)</li>
                <li>O cronograma segue a lógica cronológica original, mesmo que manutenções sejam executadas fora da janela</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo do Cronograma */}
        {selectedClientId && activeScheduleData && viewType === 'matrix' ? (
          <PreventiveScheduleMatrixView 
            scheduleData={activeScheduleData}
            year={selectedYear}
            clientName={clients?.find(c => c.id === selectedClientId)?.name || 'Cliente'}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <PreventiveScheduleTable />
            </CardContent>
          </Card>
        )}

        {/* Modal de customização PDF */}
        <PDFCustomizationModal
          isOpen={showPDFModal}
          onClose={() => setShowPDFModal(false)}
          onDownloadOriginal={handleDownloadOriginalPDF}
          onDownloadCustomized={handleDownloadCustomizedPDF}
          onPreview={handlePreviewPDF}
          title="Cronograma Preventivo"
        />
      </div>
    </DashboardLayout>
  );
};

export default PreventiveSchedule;
