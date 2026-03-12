
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Share, Mail, Trash2, Download, FileText, Palette } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { downloadReportAsPDF, downloadReportAsWord } from '@/utils/reportDownloader';
import { useUserProfile } from '@/hooks/useUserProfile';
import PDFCustomizationModal, { PDFCustomizationOptions } from '@/components/pdf/PDFCustomizationModal';

interface ReportActionsProps {
  report: any;
  onView?: (report: any) => void;
  onEdit?: (report: any) => void;
  onDelete?: (report: any) => void;
}

const ReportActions: React.FC<ReportActionsProps> = ({
  report,
  onView,
  onEdit,
  onDelete
}) => {
  const { data: userProfile } = useUserProfile();
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const shareByEmail = () => {
    const subject = `Relatório - ${report.title}`;
    const body = `
Olá,

Segue o relatório:

Título: ${report.title}
Data: ${new Date(report.report_date).toLocaleDateString('pt-BR')}
${report.equipments ? `Equipamento: ${report.equipments.name}` : ''}
${report.technicians ? `Técnico: ${report.technicians.name}` : ''}

${report.description || ''}

Atenciosamente,
Sua Empresa
    `;
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
    toast.success('Email aberto para compartilhamento!');
  };

  const shareByWhatsApp = () => {
    const message = `*Relatório*\n\n` +
      `*Título:* ${report.title}\n` +
      `*Data:* ${new Date(report.report_date).toLocaleDateString('pt-BR')}\n` +
      `${report.equipments ? `*Equipamento:* ${report.equipments.name}\n` : ''}` +
      `${report.technicians ? `*Técnico:* ${report.technicians.name}\n` : ''}` +
      `\n${report.description || ''}`;
    
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
    toast.success('WhatsApp aberto para compartilhamento!');
  };

  const getEnrichedReportData = () => ({
    ...report,
    company_logo: userProfile?.company_logo_url || undefined,
    company_name: userProfile?.company_name,
    company_address: userProfile?.company_address,
    company_phone: userProfile?.phone,
    company_email: userProfile?.company_email,
    full_name: userProfile?.full_name,
    position: userProfile?.position,
    department: userProfile?.department,
    cnpj: userProfile?.cnpj,
  });

  const handleDownloadPDF = async () => {
    try {
      toast.info('Gerando arquivo PDF...');
      const enriched = getEnrichedReportData();
      await downloadReportAsPDF(enriched);
      toast.success('Download PDF concluído!');
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast.error('Erro ao gerar arquivo PDF');
    }
  };

  const handleDownloadCustomizedPDF = async (options: PDFCustomizationOptions) => {
    try {
      toast.info('Gerando arquivo PDF personalizado...');
      const enriched = getEnrichedReportData();
      await downloadReportAsPDF(enriched, options);
      toast.success('Download PDF personalizado concluído!');
      setShowCustomizationModal(false);
    } catch (error) {
      console.error('Erro ao baixar PDF personalizado:', error);
      toast.error('Erro ao gerar arquivo PDF personalizado');
    }
  };

  const handlePreview = async (options: PDFCustomizationOptions): Promise<string> => {
    try {
      const enriched = getEnrichedReportData();
      const result = await downloadReportAsPDF(enriched, options, true);
      return result as string;
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      throw new Error('Erro ao gerar pré-visualização');
    }
  };

  const handleDownloadWord = async () => {
    try {
      toast.info('Gerando arquivo Word...');
      const enriched = getEnrichedReportData();
      await downloadReportAsWord(enriched);
      toast.success('Download Word concluído!');
    } catch (error) {
      console.error('Erro ao baixar Word:', error);
      toast.error('Erro ao gerar arquivo Word');
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(report);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onView?.(report)}
          title="Visualizar"
        >
          <Eye className="w-4 h-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleEdit}
          title="Editar"
        >
          <Edit className="w-4 h-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" title="Compartilhar">
              <Share className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={shareByEmail}>
              <Mail className="w-4 h-4 mr-2" />
              Compartilhar por Email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={shareByWhatsApp}>
              <Share className="w-4 h-4 mr-2" />
              Compartilhar por WhatsApp
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCustomizationModal(true)}
          className="flex items-center space-x-1"
          title="Personalizar PDF"
        >
          <Palette className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadWord}
          className="flex items-center space-x-1"
          title="Baixar Word"
        >
          <FileText className="w-4 h-4" />
        </Button>
      </div>

      <Button 
        variant="outline" 
        size="sm"
        className="text-red-600 hover:text-red-700"
        onClick={() => onDelete?.(report)}
        title="Excluir"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <PDFCustomizationModal
        isOpen={showCustomizationModal}
        onClose={() => setShowCustomizationModal(false)}
        onDownloadOriginal={handleDownloadPDF}
        onDownloadCustomized={handleDownloadCustomizedPDF}
        onPreview={handlePreview}
        title="Relatório de Manutenção PDF"
        logoUrl={typeof userProfile?.company_logo_url === 'string' ? userProfile.company_logo_url : undefined}
        showLogoScale={true}
        showLogoWidth={true}
        showLogoHeight={true}
        showLogoPosition={true}
        showSpacingControls={true}
        showTitleSpacing={true}
        showSectionSpacing={true}
        showContentPadding={true}
      />
    </div>
  );
};

export default ReportActions;
