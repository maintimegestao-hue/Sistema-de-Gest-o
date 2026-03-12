
import { generateProposalPDF } from './proposal/pdfGenerator';
import { generateProposalWord } from './proposal/wordGenerator';
import { supabase } from '@/integrations/supabase/client';
import type { PDFCustomizationOptions } from '@/components/pdf/PDFCustomizationModal';

// Re-export the ProposalData type for backward compatibility
export type { ProposalData } from './proposal/types';

export const downloadProposalAsPDF = async (proposalData: any, customOptions?: PDFCustomizationOptions, isPreview = false) => {
  try {
    // Fallback: se a proposta não tiver logo salvo, tentar usar o logo do perfil do usuário
    if (!proposalData?.company_logo && proposalData?.user_id) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_logo_url')
        .eq('user_id', proposalData.user_id)
        .maybeSingle();

      if (profile?.company_logo_url) {
        proposalData.company_logo = profile.company_logo_url;
      }
    }

    const result = await generateProposalPDF(proposalData, customOptions, isPreview);
    return isPreview ? result : true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Falha ao gerar arquivo PDF');
  }
};

export const downloadProposalAsWord = async (proposalData: any) => {
  try {
    await generateProposalWord(proposalData);
    return true;
  } catch (error) {
    console.error('Erro ao gerar Word:', error);
    throw new Error('Falha ao gerar arquivo Word');
  }
};
