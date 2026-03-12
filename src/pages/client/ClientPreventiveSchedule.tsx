import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientPreventiveScheduleView from '@/components/preventive-schedule/ClientPreventiveScheduleView';
import PreventiveScheduleMatrixView from '@/components/preventive-schedule/PreventiveScheduleMatrixView';
import { usePreventiveScheduleByClient } from '@/hooks/usePreventiveScheduleByClient';
import { usePreventiveSchedulePDFCustomizable } from '@/hooks/usePreventiveSchedulePDFCustomizable';
import PDFCustomizationModal, { PDFCustomizationOptions } from '@/components/pdf/PDFCustomizationModal';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSecureClients } from '@/hooks/useSecureClients';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ClientPreventiveSchedule = () => {
  const { clientId } = useParams();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [viewType, setViewType] = useState<'list' | 'matrix'>('matrix');

  const { data: clients } = useSecureClients();
  const { data: scheduleData, isLoading } = usePreventiveScheduleByClient(clientId || '', selectedYear);
  const { exportToPDF } = usePreventiveSchedulePDFCustomizable();

  const client = clients?.find(c => c.id === clientId);

  const handleDownloadOriginalPDF = () => {
    if (scheduleData && client) {
      exportToPDF(scheduleData, selectedYear, client.name);
    }
  };

  const handleDownloadCustomizedPDF = (options: PDFCustomizationOptions) => {
    if (scheduleData && client) {
      exportToPDF(scheduleData, selectedYear, client.name, options);
      setShowPDFModal(false);
    }
  };

  const handlePreviewPDF = async (options: PDFCustomizationOptions): Promise<string> => {
    if (scheduleData && client) {
      return await exportToPDF(scheduleData, selectedYear, client.name, options, true) as string;
    }
    return '';
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header com controles */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cronograma Preventivo</h1>
            <p className="text-muted-foreground">
              {client ? `${client.name} - Ano ${selectedYear}` : 'Cronograma de manutenção preventiva'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Toggle de visualização */}
            <div className="flex rounded-lg border p-1">
              <Button
                variant={viewType === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('list')}
              >
                Lista
              </Button>
              <Button
                variant={viewType === 'matrix' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('matrix')}
              >
                Matriz
              </Button>
            </div>

            {/* Download PDF */}
            {scheduleData && scheduleData.length > 0 && (
              <Button
                onClick={() => setShowPDFModal(true)}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar PDF
              </Button>
            )}
          </div>
        </div>

        {/* Conteúdo baseado no tipo de visualização */}
        {viewType === 'matrix' && scheduleData && client ? (
          <PreventiveScheduleMatrixView 
            scheduleData={scheduleData}
            year={selectedYear}
            clientName={client.name}
          />
        ) : (
          <ClientPreventiveScheduleView clientId={clientId} />
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

export default ClientPreventiveSchedule;