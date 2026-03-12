
import { generateReportPDF } from './report/pdfGenerator';
import { generateReportWord } from './report/wordGenerator';
import type { PDFCustomizationOptions } from '@/components/pdf/PDFCustomizationModal';

// Re-export the ReportData type for backward compatibility
export type { ReportData } from './report/types';

export const downloadReportAsPDF = async (reportData: any, customOptions?: PDFCustomizationOptions, isPreview = false) => {
  try {
    const result = await generateReportPDF(reportData, customOptions, isPreview);
    return isPreview ? result : true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Falha ao gerar arquivo PDF');
  }
};

export const downloadReportAsWord = async (reportData: any) => {
  try {
    await generateReportWord(reportData);
    return true;
  } catch (error) {
    console.error('Erro ao gerar Word:', error);
    throw new Error('Falha ao gerar arquivo Word');
  }
};
