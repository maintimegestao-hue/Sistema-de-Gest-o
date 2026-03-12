
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { downloadReportAsPDF, downloadReportAsWord, ReportData } from '@/utils/reportDownloader';
import PDFCustomizationModal, { PDFCustomizationOptions } from '@/components/pdf/PDFCustomizationModal';

interface ReportDownloadButtonsProps {
  reportData: ReportData;
  reportTitle: string;
}

const ReportDownloadButtons: React.FC<ReportDownloadButtonsProps> = ({ 
  reportData, 
  reportTitle 
}) => {
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const downloadPDF = async () => {
    try {
      toast.info('Gerando arquivo PDF...');
      await downloadReportAsPDF(reportData);
      toast.success('Download PDF concluído!');
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast.error('Erro ao gerar arquivo PDF');
    }
  };

  const downloadCustomizedPDF = async (options: PDFCustomizationOptions) => {
    try {
      toast.info('Gerando arquivo PDF personalizado...');
      await downloadReportAsPDF(reportData, options);
      toast.success('Download PDF personalizado concluído!');
      setShowCustomizationModal(false);
    } catch (error) {
      console.error('Erro ao baixar PDF personalizado:', error);
      toast.error('Erro ao gerar arquivo PDF personalizado');
    }
  };

  const handlePreview = async (options: PDFCustomizationOptions): Promise<string> => {
    try {
      const result = await downloadReportAsPDF(reportData, options, true);
      return result as string;
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      throw new Error('Erro ao gerar pré-visualização');
    }
  };

  const downloadWord = async () => {
    try {
      toast.info('Gerando arquivo Word...');
      await downloadReportAsWord(reportData);
      toast.success('Download Word concluído!');
    } catch (error) {
      console.error('Erro ao baixar Word:', error);
      toast.error('Erro ao gerar arquivo Word');
    }
  };

  return (
    <>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCustomizationModal(true)}
          className="flex items-center space-x-1"
        >
          <Palette size={14} />
          <span>PDF</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadWord}
          className="flex items-center space-x-1"
        >
          <FileText size={14} />
          <span>Word</span>
        </Button>
      </div>

        <PDFCustomizationModal
          isOpen={showCustomizationModal}
          onClose={() => setShowCustomizationModal(false)}
          onDownloadOriginal={downloadPDF}
          onDownloadCustomized={downloadCustomizedPDF}
          onPreview={handlePreview}
          title="Relatório PDF"
          logoUrl={typeof reportData?.company_logo === 'string' ? reportData.company_logo : undefined}
          showLogoWidth={true}
          showLogoHeight={true}
          showLogoPosition={true}
          showTitleSpacing={true}
          showSectionSpacing={true}
          showContentPadding={true}
        />
    </>
  );
};

export default ReportDownloadButtons;
