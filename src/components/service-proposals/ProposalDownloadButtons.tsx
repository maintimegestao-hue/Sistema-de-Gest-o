import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { downloadProposalAsPDF, downloadProposalAsWord } from '@/utils/proposalDownloader';
import PDFCustomizationModal, { PDFCustomizationOptions } from '@/components/pdf/PDFCustomizationModal';

interface ProposalDownloadButtonsProps {
  proposalData: any;
  proposalTitle: string;
  onGetFullData?: () => Promise<any>;
}

const ProposalDownloadButtons: React.FC<ProposalDownloadButtonsProps> = ({ 
  proposalData, 
  proposalTitle,
  onGetFullData 
}) => {
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  
  const downloadPDF = async () => {
    try {
      const data = onGetFullData ? await onGetFullData() : proposalData;
      toast.info('Gerando arquivo PDF...');
      await downloadProposalAsPDF(data);
      toast.success('Download PDF concluído!');
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast.error('Erro ao gerar arquivo PDF');
    }
  };

  const downloadCustomizedPDF = async (options: PDFCustomizationOptions) => {
    try {
      const data = onGetFullData ? await onGetFullData() : proposalData;
      toast.info('Gerando arquivo PDF personalizado...');
      await downloadProposalAsPDF(data, options);
      toast.success('Download PDF personalizado concluído!');
      setShowCustomizationModal(false);
    } catch (error) {
      console.error('Erro ao baixar PDF personalizado:', error);
      toast.error('Erro ao gerar arquivo PDF personalizado');
    }
  };

  const handlePreview = async (options: PDFCustomizationOptions): Promise<string> => {
    try {
      const data = onGetFullData ? await onGetFullData() : proposalData;
      const result = await downloadProposalAsPDF(data, options, true);
      return result as string;
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      throw new Error('Erro ao gerar pré-visualização');
    }
  };

  const downloadWord = async () => {
    try {
      const data = onGetFullData ? await onGetFullData() : proposalData;
      toast.info('Gerando arquivo Word...');
      await downloadProposalAsWord(data);
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
          title="Relatório de Manutenção PDF"
          logoUrl={typeof proposalData?.company_logo === 'string' ? proposalData.company_logo : undefined}
          showLogoScale={true}
          showLogoWidth={true}
          showLogoHeight={true}
          showLogoPosition={true}
          showSpacingControls={true}
          showTitleSpacing={true}
          showSectionSpacing={true}
          showContentPadding={true}
        />
    </>
  );
};

export default ProposalDownloadButtons;