
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Share, Mail, Trash2, Send, Download, FileText, Palette } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/alert-dialog';
import { downloadProposalAsPDF, downloadProposalAsWord } from '@/utils/proposalDownloader';
import { supabase } from '@/integrations/supabase/client';
import PDFCustomizationModal, { PDFCustomizationOptions } from '@/components/pdf/PDFCustomizationModal';

interface ProposalActionsProps {
  proposal: any;
  onView?: (proposal: any) => void;
  onEdit?: (proposal: any) => void;
  onDelete?: (proposal: any) => void;
  onSend?: (proposal: any) => void;
}

const ProposalActions: React.FC<ProposalActionsProps> = ({
  proposal,
  onView,
  onEdit,
  onDelete,
  onSend
}) => {
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [proposalData, setProposalData] = useState<any>(null);
  const shareByEmail = () => {
    const subject = `Proposta de Serviço - ${proposal.title}`;
    const body = `
Olá,

Segue a proposta de serviço:

Título: ${proposal.title}
Número: ${proposal.proposal_number}
Cliente: ${proposal.clients?.name || 'N/A'}
Valor Total: R$ ${proposal.total_cost?.toFixed(2) || '0.00'}
Validade: ${proposal.validity_days} dias

${proposal.description || ''}

Atenciosamente,
Sua Empresa
    `;
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
    toast.success('Email aberto para compartilhamento!');
  };

  const shareByWhatsApp = () => {
    const message = `*Proposta de Serviço*\n\n` +
      `*Título:* ${proposal.title}\n` +
      `*Número:* ${proposal.proposal_number}\n` +
      `*Cliente:* ${proposal.clients?.name || 'N/A'}\n` +
      `*Valor Total:* R$ ${proposal.total_cost?.toFixed(2) || '0.00'}\n` +
      `*Validade:* ${proposal.validity_days} dias\n\n` +
      `${proposal.description || ''}`;
    
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
    toast.success('WhatsApp aberto para compartilhamento!');
  };

  const fetchProposalData = async () => {
    try {
      const { data, error } = await supabase
        .from('service_proposals')
        .select(`
          *,
          clients(name, address, city, state, zip_code, phone, email, contact_person, cnpj),
          equipments(name)
        `)
        .eq('id', proposal.id)
        .single();

      if (error) throw error;
      return data || proposal;
    } catch (error) {
      console.error('Erro ao buscar dados da proposta:', error);
      toast.error('Erro ao buscar dados da proposta');
      return null;
    }
  };

  const handleDownloadPDF = async () => {
    try {
      toast.info('Gerando arquivo PDF...');
      const fullProposal = await fetchProposalData();
      if (!fullProposal) return;

      await downloadProposalAsPDF(fullProposal);
      toast.success('✅ Download PDF concluído!');
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast.error('❌ Erro ao gerar arquivo PDF');
    }
  };

  const handleCustomizePDF = async () => {
    try {
      const data = await fetchProposalData();
      if (!data) return;
      
      setProposalData(data);
      setShowCustomizationModal(true);
    } catch (error) {
      console.error('Erro ao preparar personalização:', error);
      toast.error('Erro ao preparar personalização');
    }
  };

  const handleDownloadCustomizedPDF = async (options: PDFCustomizationOptions) => {
    try {
      toast.info('Gerando arquivo PDF personalizado...');
      const fullProposal = await fetchProposalData();
      if (!fullProposal) return;
      
      await downloadProposalAsPDF(fullProposal, options);
      toast.success('✅ Download PDF personalizado concluído!');
      setShowCustomizationModal(false);
    } catch (error) {
      console.error('Erro ao baixar PDF personalizado:', error);
      toast.error('❌ Erro ao gerar arquivo PDF personalizado');
    }
  };

  const handlePreview = async (options: PDFCustomizationOptions): Promise<string> => {
    try {
      const fullProposal = await fetchProposalData();
      if (!fullProposal) throw new Error('Dados da proposta não encontrados');
      
      const result = await downloadProposalAsPDF(fullProposal, options, true);
      return result as string;
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      throw new Error('Erro ao gerar pré-visualização');
    }
  };

  const handleDownloadWord = async () => {
    try {
      toast.info('Gerando arquivo Word...');
      const fullProposal = await fetchProposalData();
      if (!fullProposal) return;

      await downloadProposalAsWord(fullProposal);
      toast.success('✅ Download Word concluído!');
    } catch (error) {
      console.error('Erro ao baixar Word:', error);
      toast.error('❌ Erro ao gerar arquivo Word');
    }
  };

  const handleView = () => {
    console.log('Visualizando proposta:', proposal);
    toast.success(`📄 Visualizando: ${proposal.title}`);
    if (onView) {
      onView(proposal);
    }
  };

  const handleEdit = () => {
    console.log('Editando proposta:', proposal);
    toast.info(`✏️ Editando: ${proposal.title}`);
    if (onEdit) {
      onEdit(proposal);
    }
  };

  const handleDeleteConfirm = () => {
    console.log('Excluindo proposta:', proposal);
    toast.success(`🗑️ Proposta "${proposal.title}" foi excluída com sucesso!`);
    if (onDelete) {
      onDelete(proposal);
    }
  };

  const handleSend = () => {
    console.log('Enviando proposta:', proposal);
    toast.success(`📤 Proposta "${proposal.title}" foi enviada!`);
    if (onSend) {
      onSend(proposal);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleView}
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" title="Baixar">
              <Download className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleCustomizePDF}>
              <Palette className="w-4 h-4 mr-2" />
              PDF Personalizado
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadWord}>
              <FileText className="w-4 h-4 mr-2" />
              Baixar Word
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {proposal.status === 'draft' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSend}
            title="Enviar"
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 hover:text-red-700"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a proposta "{proposal.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PDFCustomizationModal
        isOpen={showCustomizationModal}
        onClose={() => setShowCustomizationModal(false)}
        onDownloadOriginal={handleDownloadPDF}
        onDownloadCustomized={handleDownloadCustomizedPDF}
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
    </div>
  );
};

export default ProposalActions;
