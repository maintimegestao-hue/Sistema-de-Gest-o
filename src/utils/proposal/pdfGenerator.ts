
import jsPDF from 'jspdf';
import { ProposalData } from './types';
import { supabase } from '@/integrations/supabase/client';

const convertFileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const fetchImageAsDataURL = async (url: string): Promise<string> => {
  const res = await fetch(url, { mode: 'cors' });
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const ensureDataURL = async (input: string | File): Promise<string> => {
  if (input instanceof File) return convertFileToDataURL(input);
  if (typeof input === 'string' && input.startsWith('data:')) return input;
  return await fetchImageAsDataURL(input as string);
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const generateProposalPDF = async (proposalData: ProposalData, customOptions?: any, isPreview = false): Promise<void | string> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Configure encoding para evitar símbolos estranhos
  pdf.setCharSpace(0);
  pdf.setR2L(false);
  
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  let currentY = margin;

  // Configurações padrão ou personalizadas
  const options = customOptions || {
    fontFamily: 'helvetica',
    fontSize: 12,
    fontStyle: 'normal',
    headerBackgroundColor: '#22c55e',
    headerTextColor: '#ffffff',
    useLogoColor: false,
    logoColors: []
  };

  // Converter cores hex para RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 34, g: 197, b: 94 };
  };

  const headerBgColor = hexToRgb(options.headerBackgroundColor);
  const headerTextColor = hexToRgb(options.headerTextColor);
  const titleBgColor = hexToRgb(options.titleBackgroundColor);
  const titleTextColor = hexToRgb(options.titleTextColor);

  // Cores do design system (personalizáveis)
  const colors = {
    primary: [headerBgColor.r, headerBgColor.g, headerBgColor.b] as [number, number, number],
    primaryLight: [76, 175, 80] as [number, number, number], // Verde médio  
    secondary: [64, 64, 64] as [number, number, number], // Cinza escuro quase preto para títulos
    accent: [255, 152, 0] as [number, number, number], // Laranja
    background: [248, 249, 250] as [number, number, number], // Cinza claro
    text: [33, 33, 33] as [number, number, number], // Cinza escuro
    border: [224, 224, 224] as [number, number, number], // Cinza médio
    white: [255, 255, 255] as [number, number, number],
    darkGray: [48, 48, 48] as [number, number, number], // Cinza escuro quase preto
    headerText: [headerTextColor.r, headerTextColor.g, headerTextColor.b] as [number, number, number],
    titleBg: [titleBgColor.r, titleBgColor.g, titleBgColor.b] as [number, number, number],
    titleText: [titleTextColor.r, titleTextColor.g, titleTextColor.b] as [number, number, number]
  };

  // Helper function to add new page if needed
  const checkNewPage = (requiredHeight: number) => {
    if (currentY + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
      return true;
    }
    return false;
  };

  // Helper function to wrap text properly
  const wrapText = (text: string, maxWidth: number, fontSize: number = 8) => {
    pdf.setFontSize(fontSize);
    return pdf.splitTextToSize(text, maxWidth);
  };

  // Helper function to draw professional table with improved alignment
  const drawTable = (headers: string[], rows: string[][], startY: number, colWidths: number[], isTotal = false) => {
    const rowHeight = 10;
    const headerHeight = 12;
    const padding = 3;
    
    // Table header with gradient effect
    pdf.setFillColor(...colors.primary);
    pdf.rect(margin, startY, contentWidth, headerHeight, 'F');
    
    // Header border
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, startY, contentWidth, headerHeight);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.white);
    
    // Draw headers with proper alignment
    let xPos = margin;
    headers.forEach((header, index) => {
      const cellWidth = colWidths[index];
      const textWidth = pdf.getTextWidth(header);
      const centerX = xPos + (cellWidth / 2) - (textWidth / 2);
      pdf.text(header, centerX, startY + 8);
      xPos += cellWidth;
    });
    
    // Vertical lines for header
    xPos = margin;
    colWidths.forEach((width, index) => {
      if (index > 0) {
        pdf.setDrawColor(...colors.white);
        pdf.setLineWidth(1);
        pdf.line(xPos, startY, xPos, startY + headerHeight);
      }
      xPos += width;
    });
    
    // Table rows
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...colors.text);
    let yPos = startY + headerHeight;
    
    rows.forEach((row, rowIndex) => {
      // Determine row height based on content
      let maxRowHeight = rowHeight;
      row.forEach((cell, cellIndex) => {
        const cellWidth = colWidths[cellIndex] - (padding * 2);
        const wrappedText = wrapText(cell, cellWidth);
        const requiredHeight = wrappedText.length * 4 + padding;
        maxRowHeight = Math.max(maxRowHeight, requiredHeight);
      });
      
      // Alternate row colors
      if (rowIndex % 2 === 1 && !isTotal) {
        pdf.setFillColor(...colors.background);
        pdf.rect(margin, yPos, contentWidth, maxRowHeight, 'F');
      }
      
      // Total row highlighting
      if (isTotal) {
        pdf.setFillColor(...colors.primaryLight);
        pdf.rect(margin, yPos, contentWidth, maxRowHeight, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(...colors.white);
      }
      
      // Row border
      pdf.setDrawColor(...colors.border);
      pdf.setLineWidth(0.3);
      pdf.rect(margin, yPos, contentWidth, maxRowHeight);
      
      // Draw cells with proper alignment and text wrapping
      xPos = margin;
      row.forEach((cell, cellIndex) => {
        const cellWidth = colWidths[cellIndex];
        const textWidth = pdf.getTextWidth(cell);
        
        // Determine alignment
        let textX = xPos + padding;
        if (cellIndex >= 2) { // Right align for quantities and values
          textX = xPos + cellWidth - padding - textWidth;
        } else if (cellIndex === 0) { // Left align for description
          textX = xPos + padding;
        } else { // Center align for unit
          textX = xPos + (cellWidth / 2) - (textWidth / 2);
        }
        
        // Wrap text if needed
        const wrappedText = wrapText(cell, cellWidth - (padding * 2));
        wrappedText.forEach((line: string, lineIndex: number) => {
          const lineY = yPos + padding + 4 + (lineIndex * 4);
          if (cellIndex >= 2) {
            // Right align for numbers
            const lineWidth = pdf.getTextWidth(line);
            pdf.text(line, xPos + cellWidth - padding - lineWidth, lineY);
          } else if (cellIndex === 1) {
            // Center align for unit
            const lineWidth = pdf.getTextWidth(line);
            pdf.text(line, xPos + (cellWidth / 2) - (lineWidth / 2), lineY);
          } else {
            // Left align for description
            pdf.text(line, xPos + padding, lineY);
          }
        });
        
        // Vertical lines
        if (cellIndex > 0) {
          pdf.setDrawColor(...colors.border);
          pdf.setLineWidth(0.3);
          pdf.line(xPos, yPos, xPos, yPos + maxRowHeight);
        }
        
        xPos += cellWidth;
      });
      
      yPos += maxRowHeight;
      
      // Reset font for next row
      if (isTotal) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(...colors.text);
      }
    });
    
    return yPos + 8;
  };

  // === CABEÇALHO LIMPO E ORGANIZADO ===
  
  // Logo da empresa no canto superior direito (se existir)
  let logoHeight = 0;
  console.log('🖼️ Verificando logo da empresa:', proposalData.company_logo);
  
  // Logo posicionado na parte superior esquerda, acima do nome da empresa
  if (proposalData.company_logo) {
      try {
        let logoDataURL: string;
        console.log('🖼️ Tipo do logo:', typeof proposalData.company_logo);
        console.log('🖼️ É instância de File?', proposalData.company_logo instanceof File);
        
        if (proposalData.company_logo instanceof File) {
          console.log('🖼️ Convertendo File para DataURL...');
          logoDataURL = await convertFileToDataURL(proposalData.company_logo);
          console.log('🖼️ DataURL gerada:', logoDataURL.substring(0, 50) + '...');
        } else if (typeof proposalData.company_logo === 'string') {
          console.log('🖼️ Logo é string:', proposalData.company_logo.substring(0, 50) + '...');
          // Verificar se é uma URL ou data URL
          if (proposalData.company_logo.startsWith('data:')) {
            logoDataURL = proposalData.company_logo;
            console.log('🖼️ Data URL detectada');
          } else if (proposalData.company_logo.startsWith('http')) {
            console.log('🖼️ Buscando logo via URL para DataURL...');
            logoDataURL = await fetchImageAsDataURL(proposalData.company_logo);
            console.log('🖼️ Logo convertida para DataURL');
          } else {
            console.log('🖼️ String não é URL válida');
            throw new Error('Formato de logo não suportado');
          }
        } else {
          console.log('🖼️ Tipo de logo não suportado:', typeof proposalData.company_logo);
          throw new Error('Formato de logo não suportado');
        }
        
        if (logoDataURL && (logoDataURL.includes('data:image') || logoDataURL.startsWith('http'))) {
          const logoScale = customOptions?.logoScale || 1;
          const logoWidth = 50 * logoScale;
          const logoHeightValue = 20 * logoScale;
          
          // Calcular posição X baseada na opção de posição
          let logoX = margin; // Posição padrão à esquerda
          const logoPosition = customOptions?.logoPosition || 'left';
          
          if (logoPosition === 'center') {
            logoX = (pageWidth - logoWidth) / 2;
          } else if (logoPosition === 'right') {
            logoX = pageWidth - margin - logoWidth;
          }
          
          const format = logoDataURL.includes('data:image/png') ? 'PNG' : 'JPEG';
          console.log(`🖼️ Adicionando logo ao PDF - Posição: ${logoPosition} (${logoX}, ${currentY}), Tamanho: ${logoWidth}x${logoHeightValue}, Formato: ${format}`);
          pdf.addImage(logoDataURL, format, logoX, currentY, logoWidth, logoHeightValue);
          logoHeight = logoHeightValue;
          console.log('✅ Logo adicionado com sucesso!');
        } else {
          console.log('❌ DataURL inválida:', logoDataURL?.substring(0, 50));
        }
      } catch (error) {
        console.error('❌ Erro ao carregar logo:', error);
        logoHeight = 0;
      }
  } else {
    console.log('❌ Nenhum logo fornecido na proposalData');
  }
  
  // Ajustar posição Y para ficar abaixo do logo
  const companyInfoY = currentY + logoHeight + 5;
  
  // Informações da empresa - ALINHADO À ESQUERDA, abaixo do logo
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.text);
  
  if (proposalData.company_name) {
    pdf.text(proposalData.company_name, margin, companyInfoY + 8);
  }
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  
  let companyY = companyInfoY + 16;
  if (proposalData.company_address) {
    pdf.text(proposalData.company_address, margin, companyY);
    companyY += 4;
  }
  
  if (proposalData.company_phone) {
    pdf.text(`Tel: ${proposalData.company_phone}`, margin, companyY);
    companyY += 4;
  }
  
  if (proposalData.company_email) {
    pdf.text(proposalData.company_email, margin, companyY);
    companyY += 4;
  }

  // Data e número da proposta - ALINHADO À DIREITA (com espaçamento correto)
  const dateText = new Date().toLocaleDateString('pt-BR');
  const proposalText = proposalData.proposal_number;
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(...colors.text);
  
  // DATA alinhada à direita na mesma altura do nome da empresa
  const dataLabel = 'DATA:';
  const dataLabelWidth = pdf.getTextWidth(dataLabel);
  pdf.text(dataLabel, pageWidth - margin - dataLabelWidth, companyInfoY + 8);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  const dateWidth = pdf.getTextWidth(dateText);
  pdf.text(dateText, pageWidth - margin - dateWidth, companyInfoY + 16);
  
  // PROPOSTA alinhada à direita 
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  const proposalLabel = 'PROPOSTA:';
  const proposalLabelWidth = pdf.getTextWidth(proposalLabel);
  pdf.text(proposalLabel, pageWidth - margin - proposalLabelWidth, companyInfoY + 24);
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  const proposalWidth = pdf.getTextWidth(proposalText);
  pdf.text(proposalText, pageWidth - margin - proposalWidth, companyInfoY + 32);
  
  currentY = Math.max(companyY + 8, companyInfoY + 40);

  // === TÍTULO PRINCIPAL COM DESIGN MELHORADO ===
  pdf.setFillColor(...colors.primary);
  pdf.rect(margin, currentY, contentWidth, 20, 'F');
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.white);
  const titleText = 'PROPOSTA DE SERVIÇO / ORÇAMENTO';
  const titleWidth = pdf.getTextWidth(titleText);
  pdf.text(titleText, (pageWidth - titleWidth) / 2, currentY + 13);
  currentY += 30;

  // === DADOS DO CLIENTE - ALINHADO À ESQUERDA ===
  checkNewPage(60);
  
  // Header da seção com icone simplificado
  pdf.setFillColor(...colors.titleBg);
  pdf.rect(margin, currentY, contentWidth, 12, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.titleText);
  pdf.text('DADOS DO CLIENTE', margin + 5, currentY + 8);
  currentY += 18;

  // Calcular altura dinâmica para box do cliente baseado nos campos disponíveis
  let clientBoxHeight = 16; // Altura base
  
  if (proposalData.clients) {
    if (proposalData.clients.name) clientBoxHeight += 8;
    if (proposalData.clients.address) clientBoxHeight += 8;
    if (proposalData.clients.city || proposalData.clients.state || proposalData.clients.zip_code) clientBoxHeight += 8;
    if (proposalData.clients.phone) clientBoxHeight += 8;
    if (proposalData.clients.email) clientBoxHeight += 8;
    if (proposalData.clients.contact_person) clientBoxHeight += 8;
    if (proposalData.clients.cnpj) clientBoxHeight += 8;
  } else {
    clientBoxHeight = 20; // Altura para "Cliente não informado"
  }
  
  // Box for client info - alinhado corretamente com as outras seções
  pdf.setDrawColor(...colors.border);
  pdf.setFillColor(...colors.background);
  pdf.setLineWidth(1);
  pdf.rect(margin, currentY, contentWidth, clientBoxHeight, 'FD');

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.text);
  
  if (proposalData.clients) {
    let clientY = currentY + 8;
    
    // Nome do cliente
    if (proposalData.clients.name) {
      pdf.setFont('helvetica', 'bold');
      const nomeLabel = 'Nome: ';
      pdf.text(nomeLabel, margin + 5, clientY);
      pdf.setFont('helvetica', 'normal');
      const nomeLabelWidth = pdf.getTextWidth(nomeLabel);
      pdf.text(proposalData.clients.name, margin + 5 + nomeLabelWidth + 2, clientY);
      clientY += 8;
    }
    
    // Endereço completo
    if (proposalData.clients.address) {
      pdf.setFont('helvetica', 'bold');
      const enderecoLabel = 'Endereço: ';
      pdf.text(enderecoLabel, margin + 5, clientY);
      pdf.setFont('helvetica', 'normal');
      const enderecoLabelWidth = pdf.getTextWidth(enderecoLabel);
      pdf.text(proposalData.clients.address, margin + 5 + enderecoLabelWidth + 2, clientY);
      clientY += 8;
    }
    
    // Cidade, Estado e CEP
    if (proposalData.clients.city || proposalData.clients.state || proposalData.clients.zip_code) {
      pdf.setFont('helvetica', 'bold');
      const cidadeLabel = 'Cidade: ';
      pdf.text(cidadeLabel, margin + 5, clientY);
      pdf.setFont('helvetica', 'normal');
      
      let cityStateText = '';
      if (proposalData.clients.city) cityStateText += proposalData.clients.city;
      if (proposalData.clients.state) {
        if (cityStateText) cityStateText += ' - ';
        cityStateText += proposalData.clients.state;
      }
      if (proposalData.clients.zip_code) {
        if (cityStateText) cityStateText += ' - CEP: ';
        cityStateText += proposalData.clients.zip_code;
      }
      
      const cidadeLabelWidth = pdf.getTextWidth(cidadeLabel);
      pdf.text(cityStateText, margin + 5 + cidadeLabelWidth + 2, clientY);
      clientY += 8;
    }
    
    // Telefone
    if (proposalData.clients.phone) {
      pdf.setFont('helvetica', 'bold');
      const telefoneLabel = 'Telefone: ';
      pdf.text(telefoneLabel, margin + 5, clientY);
      pdf.setFont('helvetica', 'normal');
      const telefoneLabelWidth = pdf.getTextWidth(telefoneLabel);
      pdf.text(proposalData.clients.phone, margin + 5 + telefoneLabelWidth + 2, clientY);
      clientY += 8;
    }
    
    // Email
    if (proposalData.clients.email) {
      pdf.setFont('helvetica', 'bold');
      const emailLabel = 'Email: ';
      pdf.text(emailLabel, margin + 5, clientY);
      pdf.setFont('helvetica', 'normal');
      const emailLabelWidth = pdf.getTextWidth(emailLabel);
      pdf.text(proposalData.clients.email, margin + 5 + emailLabelWidth + 2, clientY);
      clientY += 8;
    }
    
    // Pessoa de contato/Responsável
    if (proposalData.clients.contact_person) {
      pdf.setFont('helvetica', 'bold');
      const responsavelLabel = 'Responsável: ';
      pdf.text(responsavelLabel, margin + 5, clientY);
      pdf.setFont('helvetica', 'normal');
      const responsavelLabelWidth = pdf.getTextWidth(responsavelLabel);
      pdf.text(proposalData.clients.contact_person, margin + 5 + responsavelLabelWidth + 2, clientY);
      clientY += 8;
    }
    
    // CNPJ
    if (proposalData.clients.cnpj) {
      pdf.setFont('helvetica', 'bold');
      const cnpjLabel = 'CNPJ: ';
      pdf.text(cnpjLabel, margin + 5, clientY);
      pdf.setFont('helvetica', 'normal');
      const cnpjLabelWidth = pdf.getTextWidth(cnpjLabel);
      pdf.text(proposalData.clients.cnpj, margin + 5 + cnpjLabelWidth + 2, clientY);
      clientY += 8;
    }
  } else {
    // Caso não tenha cliente selecionado
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.text);
    pdf.text('Cliente não informado', margin + 5, currentY + 12);
  }
  
  currentY += clientBoxHeight + 10;

  // === INFORMAÇÕES DA PROPOSTA ===
  checkNewPage(80);
  
  // Header da seção
  pdf.setFillColor(...colors.titleBg);
  pdf.rect(margin, currentY, contentWidth, 12, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.titleText);
  pdf.text('INFORMAÇÕES DA PROPOSTA', margin + 5, currentY + 8);
  currentY += 18;

  // Calcular altura dinâmica para box das informações baseado nos campos disponíveis
  let infoBoxHeight = 8; // Altura base reduzida
  
  if (proposalData.title) infoBoxHeight += 6;
  if (proposalData.estimated_duration) infoBoxHeight += 6;
  if (proposalData.validity_days) infoBoxHeight += 6;
  if (proposalData.start_date) infoBoxHeight += 6;
  if (proposalData.end_date) infoBoxHeight += 6;
  if (proposalData.payment_method) infoBoxHeight += 6;
  if (proposalData.discount_percentage && proposalData.discount_percentage > 0) infoBoxHeight += 6;
  
  // Box for proposal info
  pdf.setDrawColor(...colors.border);
  pdf.setFillColor(...colors.background);
  pdf.setLineWidth(1);
  pdf.rect(margin, currentY, contentWidth, infoBoxHeight, 'FD');

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.text);
  
  let infoY = currentY + 5; // Posição inicial mais próxima do topo
  
  // Título da Proposta
  if (proposalData.title) {
    pdf.setFont('helvetica', 'bold');
    const tituloLabel = 'Título: ';
    pdf.text(tituloLabel, margin + 3, infoY);
    pdf.setFont('helvetica', 'normal');
    const tituloLabelWidth = pdf.getTextWidth(tituloLabel);
    pdf.text(proposalData.title, margin + 3 + tituloLabelWidth + 2, infoY);
    infoY += 6;
  }
  
  // Prazo Estimado
  if (proposalData.estimated_duration) {
    pdf.setFont('helvetica', 'bold');
    const prazoLabel = 'Prazo Estimado: ';
    pdf.text(prazoLabel, margin + 3, infoY);
    pdf.setFont('helvetica', 'normal');
    const prazoLabelWidth = pdf.getTextWidth(prazoLabel);
    pdf.text(`${proposalData.estimated_duration} dias`, margin + 3 + prazoLabelWidth + 2, infoY);
    infoY += 6;
  }
  
  // Validade da Proposta
  if (proposalData.validity_days) {
    pdf.setFont('helvetica', 'bold');
    const validadeLabel = 'Validade: ';
    pdf.text(validadeLabel, margin + 3, infoY);
    pdf.setFont('helvetica', 'normal');
    const validadeLabelWidth = pdf.getTextWidth(validadeLabel);
    pdf.text(`${proposalData.validity_days} dias`, margin + 3 + validadeLabelWidth + 2, infoY);
    infoY += 6;
  }

  // Data de Início
  if (proposalData.start_date) {
    pdf.setFont('helvetica', 'bold');
    const inicioLabel = 'Data de Início: ';
    pdf.text(inicioLabel, margin + 3, infoY);
    pdf.setFont('helvetica', 'normal');
    const inicioLabelWidth = pdf.getTextWidth(inicioLabel);
    const startDate = new Date(proposalData.start_date).toLocaleDateString('pt-BR');
    pdf.text(startDate, margin + 3 + inicioLabelWidth + 2, infoY);
    infoY += 6;
  }

  // Data de Término
  if (proposalData.end_date) {
    pdf.setFont('helvetica', 'bold');
    const fimLabel = 'Data de Término: ';
    pdf.text(fimLabel, margin + 3, infoY);
    pdf.setFont('helvetica', 'normal');
    const fimLabelWidth = pdf.getTextWidth(fimLabel);
    const endDate = new Date(proposalData.end_date).toLocaleDateString('pt-BR');
    pdf.text(endDate, margin + 3 + fimLabelWidth + 2, infoY);
    infoY += 6;
  }
  
  // Forma de Pagamento
  if (proposalData.payment_method) {
    pdf.setFont('helvetica', 'bold');
    const pagamentoLabel = 'Forma de Pagamento: ';
    pdf.text(pagamentoLabel, margin + 3, infoY);
    pdf.setFont('helvetica', 'normal');
    const paymentMethodText = proposalData.payment_method === 'avista' ? 'À vista' : 
                              proposalData.payment_method === 'parcelado' ? 'Parcelado' : 
                              proposalData.payment_method;
    const pagamentoLabelWidth = pdf.getTextWidth(pagamentoLabel);
    pdf.text(paymentMethodText, margin + 3 + pagamentoLabelWidth + 2, infoY);
    infoY += 6;
  }
  
  // Desconto
  if (proposalData.discount_percentage && proposalData.discount_percentage > 0) {
    pdf.setFont('helvetica', 'bold');
    const descontoLabel = 'Desconto: ';
    pdf.text(descontoLabel, margin + 3, infoY);
    pdf.setFont('helvetica', 'normal');
    const descontoLabelWidth = pdf.getTextWidth(descontoLabel);
    pdf.text(`${proposalData.discount_percentage}%`, margin + 3 + descontoLabelWidth + 2, infoY);
    infoY += 6;
  }
  
  currentY += infoBoxHeight + 15;

  // === DESCRIÇÃO DA PROPOSTA ===
  if (proposalData.description) {
    checkNewPage(40);
    
    // Header da seção
    pdf.setFillColor(...colors.titleBg);
    pdf.rect(margin, currentY, contentWidth, 12, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.titleText);
    pdf.text('DESCRIÇÃO DA PROPOSTA', margin + 5, currentY + 8);
    currentY += 18;

    // Caixa da descrição com altura dinâmica
    const descriptionText = proposalData.description;
    const splitDescription = wrapText(descriptionText, contentWidth - 20, 9);
    const descriptionHeight = Math.max(20, (splitDescription.length * 4.5) + 15);
    
    pdf.setDrawColor(...colors.border);
    pdf.setFillColor(...colors.background);
    pdf.setLineWidth(1);
    pdf.rect(margin, currentY, contentWidth, descriptionHeight, 'FD');

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.text);
    
    splitDescription.forEach((line: string, index: number) => {
      pdf.text(line, margin + 10, currentY + 12 + (index * 4.5));
    });
    
    currentY += descriptionHeight + 15;
  }

  // === EQUIPAMENTO ===
  if (proposalData.equipments) {
    checkNewPage(40);
    
    // Header da seção
    pdf.setFillColor(...colors.titleBg);
    pdf.rect(margin, currentY, contentWidth, 12, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.titleText);
    pdf.text('EQUIPAMENTO', margin + 5, currentY + 8);
    currentY += 18;

    // Calcular altura para box do equipamento
    let equipmentBoxHeight = 16;
    if (proposalData.equipments.name) equipmentBoxHeight += 8;
    if (proposalData.equipments.model || proposalData.equipments.brand) equipmentBoxHeight += 8;
    if (proposalData.equipments.serial_number) equipmentBoxHeight += 8;
    if (proposalData.equipments.installation_location) equipmentBoxHeight += 8;

    // Box para informações do equipamento
    pdf.setDrawColor(...colors.border);
    pdf.setFillColor(...colors.background);
    pdf.setLineWidth(1);
    pdf.rect(margin, currentY, contentWidth, equipmentBoxHeight, 'FD');

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.text);
    
    let equipmentY = currentY + 8;
    
    // Nome do equipamento
    if (proposalData.equipments.name) {
      pdf.setFont('helvetica', 'bold');
      const nomeLabel = 'Equipamento: ';
      pdf.text(nomeLabel, margin + 5, equipmentY);
      pdf.setFont('helvetica', 'normal');
      const nomeLabelWidth = pdf.getTextWidth(nomeLabel);
      pdf.text(proposalData.equipments.name, margin + 5 + nomeLabelWidth + 2, equipmentY);
      equipmentY += 8;
    }
    
    // Modelo e Marca
    if (proposalData.equipments.model || proposalData.equipments.brand) {
      let modelBrandText = '';
      if (proposalData.equipments.model) modelBrandText += `Modelo: ${proposalData.equipments.model}`;
      if (proposalData.equipments.brand) {
        if (modelBrandText) modelBrandText += ' - ';
        modelBrandText += `Marca: ${proposalData.equipments.brand}`;
      }
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(modelBrandText, margin + 5, equipmentY);
      equipmentY += 8;
    }
    
    // Número de série
    if (proposalData.equipments.serial_number) {
      pdf.setFont('helvetica', 'bold');
      const serialLabel = 'Nº Série: ';
      pdf.text(serialLabel, margin + 5, equipmentY);
      pdf.setFont('helvetica', 'normal');
      const serialLabelWidth = pdf.getTextWidth(serialLabel);
      pdf.text(proposalData.equipments.serial_number, margin + 5 + serialLabelWidth + 2, equipmentY);
      equipmentY += 8;
    }
    
    // Local de instalação
    if (proposalData.equipments.installation_location) {
      pdf.setFont('helvetica', 'bold');
      const localLabel = 'Local: ';
      pdf.text(localLabel, margin + 5, equipmentY);
      pdf.setFont('helvetica', 'normal');
      const localLabelWidth = pdf.getTextWidth(localLabel);
      pdf.text(proposalData.equipments.installation_location, margin + 5 + localLabelWidth + 2, equipmentY);
      equipmentY += 8;
    }
    
    currentY += equipmentBoxHeight + 15;
  }

  // === ESCOPO DO TRABALHO COM DESIGN MELHORADO ===
  checkNewPage(40);
  
  // Header da seção
  pdf.setFillColor(...colors.titleBg);
  pdf.rect(margin, currentY, contentWidth, 12, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.titleText);
  pdf.text('ESCOPO DO TRABALHO', margin + 5, currentY + 8);
  currentY += 18;

  // Caixa do escopo com altura dinâmica e espaçamento adequado
  const scopeText = proposalData.scope_of_work || 'Escopo não definido';
  const splitScope = wrapText(scopeText, contentWidth - 20, 9);
  const scopeHeight = Math.max(30, (splitScope.length * 4.5) + 15);
  
  pdf.setDrawColor(...colors.border);
  pdf.setFillColor(...colors.background);
  pdf.setLineWidth(1);
  pdf.rect(margin, currentY, contentWidth, scopeHeight, 'FD');

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.text);
  
  splitScope.forEach((line: string, index: number) => {
    pdf.text(line, margin + 10, currentY + 12 + (index * 4.5));
  });
  
  currentY += scopeHeight + 15;

  // === TABELA DE SERVIÇOS COM DESIGN MELHORADO ===
  if (proposalData.services && proposalData.services.length > 0) {
    checkNewPage(60);

    // Tentar resolver nomes dos serviços a partir dos IDs, caso não estejam presentes
    let servicesMap: Record<string, any> = {};
    try {
      const ids = Array.from(new Set(
        (proposalData.services as any[])
          .map((s: any) => s.service_id)
          .filter((id) => !!id)
      ));
      if (ids.length > 0) {
        const { data: svcData } = await supabase
          .from('services')
          .select('id, name, description, base_price')
          .in('id', ids);
        if (svcData) {
          servicesMap = Object.fromEntries(svcData.map((s: any) => [s.id, s]));
        }
      }
    } catch (e) {
      console.error('Erro ao buscar serviços para o PDF:', e);
    }
    
    // Header da seção
    pdf.setFillColor(...colors.titleBg);
    pdf.rect(margin, currentY, contentWidth, 12, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.titleText);
    pdf.text('SERVIÇOS PRESTADOS', margin + 5, currentY + 8);
    currentY += 18;

    const serviceHeaders = ['Descrição do Serviço', 'Un.', 'Qtd', 'Valor Unit.', 'Subtotal'];
    const serviceRows = (proposalData.services as any[]).map((service: any) => {
      const svc = service.service_id ? servicesMap[service.service_id] : undefined;
      const desc = service.name || service.description || svc?.name || svc?.description || 'Serviço não especificado';
      const qty = Number(service.quantity ?? 1);
      const unitPrice = Number(service.unit_price ?? svc?.base_price ?? 0);
      const subtotal = Number(service.total_price ?? (qty * unitPrice) ?? 0);
      return [
        desc,
        'UN',
        qty.toString(),
        formatCurrency(unitPrice),
        formatCurrency(subtotal)
      ];
    });
    
    const serviceColWidths = [80, 15, 15, 30, 30];
    
    currentY = drawTable(serviceHeaders, serviceRows, currentY, serviceColWidths);
  } else if (proposalData.labor_cost > 0) {
    checkNewPage(60);
    
    // Header da seção
    pdf.setFillColor(...colors.titleBg);
    pdf.rect(margin, currentY, contentWidth, 12, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.titleText);
    pdf.text('SERVIÇOS PRESTADOS', margin + 5, currentY + 8);
    currentY += 18;

    const serviceHeaders = ['Descrição do Serviço', 'Un.', 'Qtd', 'Valor Unit.', 'Subtotal'];
    const serviceRows = [
      [
        'Serviços de manutenção e reparo',
        'UN',
        '1',
        formatCurrency(proposalData.labor_cost),
        formatCurrency(proposalData.labor_cost)
      ]
    ];
    const serviceColWidths = [80, 15, 15, 30, 30];
    
    currentY = drawTable(serviceHeaders, serviceRows, currentY, serviceColWidths);
  }

  // === TABELA DE MATERIAIS COM DESIGN MELHORADO ===
  if (proposalData.materials && proposalData.materials.length > 0) {
    checkNewPage(60);

    // Tentar resolver nomes dos materiais a partir dos IDs, caso não estejam presentes
    let materialsMap: Record<string, any> = {};
    try {
      const ids = Array.from(new Set(
        (proposalData.materials as any[])
          .map((m: any) => m.material_id)
          .filter((id) => !!id)
      ));
      if (ids.length > 0) {
        const { data: matData } = await supabase
          .from('materials')
          .select('id, name, unit_price')
          .in('id', ids);
        if (matData) {
          materialsMap = Object.fromEntries(matData.map((m: any) => [m.id, m]));
        }
      }
    } catch (e) {
      console.error('Erro ao buscar materiais para o PDF:', e);
    }
    
    // Header da seção
    pdf.setFillColor(...colors.titleBg);
    pdf.rect(margin, currentY, contentWidth, 12, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.titleText);
    pdf.text('MATERIAIS UTILIZADOS', margin + 5, currentY + 8);
    currentY += 18;

    const materialHeaders = ['Descrição do Material', 'Un.', 'Qtd', 'Valor Unit.', 'Subtotal'];
    const materialRows = (proposalData.materials as any[]).map((material: any) => {
      const mat = material.material_id ? materialsMap[material.material_id] : undefined;
      const desc = material.custom_description || material.name || material.description || mat?.name || 'Material não especificado';
      const qty = Number(material.quantity ?? 1);
      const unitPrice = Number(material.unit_price ?? mat?.unit_price ?? 0);
      const subtotal = Number(material.total_price ?? (qty * unitPrice) ?? 0);
      return [
        desc,
        'UN',
        qty.toString(),
        formatCurrency(unitPrice),
        formatCurrency(subtotal)
      ];
    });
    
    const materialColWidths = [80, 15, 15, 30, 30];
    
    currentY = drawTable(materialHeaders, materialRows, currentY, materialColWidths);
  } else if (proposalData.materials_cost > 0) {
    checkNewPage(60);
    
    // Header da seção
    pdf.setFillColor(...colors.titleBg);
    pdf.rect(margin, currentY, contentWidth, 12, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.titleText);
    pdf.text('MATERIAIS UTILIZADOS', margin + 5, currentY + 8);
    currentY += 18;

    const materialHeaders = ['Descrição do Material', 'Un.', 'Qtd', 'Valor Unit.', 'Subtotal'];
    const materialRows = [
      [
        'Materiais diversos para execução',
        'UN',
        '1',
        formatCurrency(proposalData.materials_cost),
        formatCurrency(proposalData.materials_cost)
      ]
    ];
    const materialColWidths = [80, 15, 15, 30, 30];
    
    currentY = drawTable(materialHeaders, materialRows, currentY, materialColWidths);
  }

  // === TOTAL GERAL COM DESIGN DESTACADO E DETALHADO ===
  checkNewPage(80);
  
  // Calcular totais de material e mão de obra
  let materialTotal = 0;
  let laborTotal = 0;
  
  // Somar materiais
  if (proposalData.materials && proposalData.materials.length > 0) {
    materialTotal = proposalData.materials.reduce((sum: number, material: any) => {
      return sum + (material.total_price || (material.quantity * material.unit_price) || 0);
    }, 0);
  } else if (proposalData.materials_cost > 0) {
    materialTotal = proposalData.materials_cost;
  }
  
  // Somar serviços/mão de obra
  if (proposalData.services && proposalData.services.length > 0) {
    laborTotal = proposalData.services.reduce((sum: number, service: any) => {
      return sum + (service.total_price || (service.quantity * service.unit_price) || 0);
    }, 0);
  } else if (proposalData.labor_cost > 0) {
    laborTotal = proposalData.labor_cost;
  }
  
  const totalWidth = 100;
  const totalX = margin + (contentWidth - totalWidth);
  
  // Total de Materiais
  if (materialTotal > 0) {
    pdf.setFillColor(200, 200, 200);
    pdf.rect(totalX, currentY, totalWidth, 15, 'F');
    
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.5);
    pdf.rect(totalX, currentY, totalWidth, 15);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.text);
    pdf.text('Total Materiais:', totalX + 5, currentY + 7);
    pdf.text(formatCurrency(materialTotal), totalX + 5, currentY + 12);
    
    currentY += 18;
  }
  
  // Total de Mão de Obra
  if (laborTotal > 0) {
    pdf.setFillColor(200, 200, 200);
    pdf.rect(totalX, currentY, totalWidth, 15, 'F');
    
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.5);
    pdf.rect(totalX, currentY, totalWidth, 15);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.text);
    pdf.text('Total Mão de Obra:', totalX + 5, currentY + 7);
    pdf.text(formatCurrency(laborTotal), totalX + 5, currentY + 12);
    
    currentY += 18;
  }
  
  // Total Geral com fundo verde mais escuro
  pdf.setFillColor(...colors.primary);
  pdf.rect(totalX, currentY, totalWidth, 20, 'F');
  
  pdf.setDrawColor(...colors.border);
  pdf.setLineWidth(0.5);
  pdf.rect(totalX, currentY, totalWidth, 20);
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.white);
  pdf.text('TOTAL GERAL', totalX + 5, currentY + 10);
  pdf.text(formatCurrency(proposalData.total_cost), totalX + 5, currentY + 16);
  
  currentY += 35;

  // === CONDIÇÕES DE PAGAMENTO ===
  checkNewPage(45);
  
  // Header da seção
  pdf.setFillColor(...colors.titleBg);
  pdf.rect(margin, currentY, contentWidth, 12, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.titleText);
  pdf.text('CONDIÇÕES DE PAGAMENTO', margin + 5, currentY + 8);
  currentY += 18;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.text);
  
  const paymentText = proposalData.payment_method === 'avista' ? 
    'À vista com desconto ou parcelado conforme acordo' : 'Faturamento mensal conforme execução dos serviços';
  pdf.text(paymentText, margin, currentY);
  currentY += 6;

  pdf.text(`Validade da proposta: ${proposalData.validity_days} dias`, margin, currentY);
  currentY += 18;

  // === DADOS BANCÁRIOS ===
  // Header da seção
  pdf.setFillColor(...colors.titleBg);
  pdf.rect(margin, currentY, contentWidth, 12, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...colors.titleText);
  pdf.text('DADOS BANCÁRIOS', margin + 5, currentY + 8);
  currentY += 18;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(...colors.text);
  pdf.text('Banco: 001 - Banco do Brasil', margin, currentY);
  currentY += 5;
  pdf.text('Agência: 1234-5 | Conta Corrente: 12345-6', margin, currentY);
  currentY += 5;
  pdf.text('Chave PIX: empresa@evolutec.com.br', margin, currentY);
  currentY += 20;

  // === OBSERVAÇÕES/NOTAS ===
  if (proposalData.notes && proposalData.notes.trim() !== '') {
    checkNewPage(40);
    
    // Header da seção
    pdf.setFillColor(...colors.titleBg);
    pdf.rect(margin, currentY, contentWidth, 12, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.titleText);
    pdf.text('OBSERVAÇÕES', margin + 5, currentY + 8);
    currentY += 18;

    // Caixa das observações com altura dinâmica
    const notesText = proposalData.notes;
    const splitNotes = wrapText(notesText, contentWidth - 20, 9);
    const notesHeight = Math.max(20, (splitNotes.length * 4.5) + 15);
    
    pdf.setDrawColor(...colors.border);
    pdf.setFillColor(...colors.background);
    pdf.setLineWidth(1);
    pdf.rect(margin, currentY, contentWidth, notesHeight, 'FD');

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.text);
    
    splitNotes.forEach((line: string, index: number) => {
      pdf.text(line, margin + 10, currentY + 12 + (index * 4.5));
    });
    
    currentY += notesHeight + 15;
  }

    // === GARANTIA E CONDIÇÕES - MELHORADO COM QUEBRA DE PÁGINA ===
  if (proposalData.terms_and_conditions) {
    // Calcular altura necessária para o texto
    const termsLines = wrapText(proposalData.terms_and_conditions, contentWidth - 20, 8);
    const estimatedHeight = (termsLines.length * 3.5) + 30; // Reduzido de 40 para 30
    
    // Verificar se precisa de nova página
    checkNewPage(estimatedHeight);
    
    // Header da seção
    pdf.setFillColor(...colors.titleBg);
    pdf.rect(margin, currentY, contentWidth, 12, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.titleText);
    pdf.text('CONDIÇÕES DE GARANTIA', margin + 5, currentY + 8);
    currentY += 15; // Reduzido de 12 para 15 (espaçamento menor)

    // Calcular altura real baseada no texto
    const actualHeight = Math.max(30, (termsLines.length * 3.5) + 15); // Reduzido padding
    
    // Verificar se o texto cabe na página atual
    if (currentY + actualHeight > pageHeight - margin - 80) {
      pdf.addPage();
      currentY = margin;
    }

    pdf.setDrawColor(...colors.border);
    pdf.setFillColor(...colors.background);
    pdf.setLineWidth(1);
    pdf.rect(margin, currentY, contentWidth, actualHeight, 'FD');

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.text);
    
    // Renderizar texto linha por linha com espaçamento reduzido
    termsLines.forEach((line: string, index: number) => {
      const lineY = currentY + 12 + (index * 3.5);
      // Verificar se a linha cabe na caixa atual
      if (lineY < currentY + actualHeight - 5) {
        pdf.text(line, margin + 10, lineY);
      }
    });
    
    currentY += actualHeight + 20;
  }

  // === IMAGENS ANEXADAS - MELHORADA ===
  if (proposalData.photos && proposalData.photos.length > 0) {
    checkNewPage(80);
    
    // Header da seção
    pdf.setFillColor(...colors.titleBg);
    pdf.rect(margin, currentY, contentWidth, 12, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.titleText);
    pdf.text('IMAGENS ANEXADAS', margin + 5, currentY + 8);
    currentY += 18;

    const photoWidth = 80;
    const photoHeight = 60;
    const photosPerRow = 2;
    const photoSpacing = 15;
    
    let photoCount = 0;
    for (let i = 0; i < proposalData.photos.length; i++) {
      const photo = proposalData.photos[i];
      const col = photoCount % photosPerRow;
      const row = Math.floor(photoCount / photosPerRow);
      
      const xPos = margin + (col * (photoWidth + photoSpacing));
      const yPos = currentY + (row * (photoHeight + photoSpacing + 20));
      
      // Check if we need a new page
      if (yPos + photoHeight + 20 > pageHeight - margin - 60) {
        pdf.addPage();
        currentY = margin + 20;
        photoCount = 0; // Reset photo count for new page
        
        currentY = margin;
        
        // Recalculate position for new page
        const newCol = photoCount % photosPerRow;
        const newRow = Math.floor(photoCount / photosPerRow);
        const newXPos = margin + (newCol * (photoWidth + photoSpacing));
        const newYPos = currentY + (newRow * (photoHeight + photoSpacing + 20));
        
        try {
          let photoDataURL: string;
          
          if (photo instanceof File) {
            photoDataURL = await convertFileToDataURL(photo);
          } else if (typeof photo === 'string') {
            if (photo.startsWith('data:')) {
              photoDataURL = photo;
            } else if (photo.startsWith('http') || photo.startsWith('blob:')) {
              photoDataURL = await fetchImageAsDataURL(photo);
            } else {
              console.log(`Foto ${i + 1}: Formato não suportado`);
              continue;
            }
          } else {
            console.log(`Foto ${i + 1}: Formato não suportado`);
            continue;
          }
          
          // Add shadow effect
          pdf.setFillColor(200, 200, 200);
          pdf.rect(newXPos + 2, newYPos + 2, photoWidth, photoHeight, 'F');
          
          // Add border around photo
          pdf.setDrawColor(...colors.border);
          pdf.setFillColor(...colors.white);
          pdf.setLineWidth(2);
          pdf.rect(newXPos, newYPos, photoWidth, photoHeight, 'FD');
          
          // Determinar formato da imagem
          const format = photoDataURL.includes('data:image/png') ? 'PNG' : 'JPEG';
          pdf.addImage(photoDataURL, format, newXPos + 3, newYPos + 3, photoWidth - 6, photoHeight - 6);
          
          // Photo caption with background
          pdf.setFillColor(...colors.titleBg);
          pdf.rect(newXPos, newYPos + photoHeight - 15, photoWidth, 15, 'F');
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...colors.titleText);
          const captionText = `Imagem ${i + 1}`;
          const captionWidth = pdf.getTextWidth(captionText);
          pdf.text(captionText, newXPos + (photoWidth - captionWidth) / 2, newYPos + photoHeight - 5);
          
          photoCount++;
        } catch (error) {
          console.error(`Erro ao processar foto ${i + 1}:`, error);
          // Add placeholder with error message
          pdf.setDrawColor(...colors.border);
          pdf.setFillColor(245, 245, 245);
          pdf.setLineWidth(1);
          pdf.rect(newXPos, newYPos, photoWidth, photoHeight, 'FD');
          
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`[Erro ao carregar]`, newXPos + 15, newYPos + 25);
          pdf.text(`Imagem ${i + 1}`, newXPos + 20, newYPos + 35);
          photoCount++;
        }
      } else {
        try {
          let photoDataURL: string;
          
          if (photo instanceof File) {
            photoDataURL = await convertFileToDataURL(photo);
          } else if (typeof photo === 'string') {
            if (photo.startsWith('data:')) {
              photoDataURL = photo;
            } else if (photo.startsWith('http') || photo.startsWith('blob:')) {
              photoDataURL = await fetchImageAsDataURL(photo);
            } else {
              console.log(`Foto ${i + 1}: Formato não suportado`);
              continue;
            }
          } else {
            console.log(`Foto ${i + 1}: Formato não suportado`);
            continue;
          }
          
          // Add shadow effect
          pdf.setFillColor(200, 200, 200);
          pdf.rect(xPos + 2, yPos + 2, photoWidth, photoHeight, 'F');
          
          // Add border around photo
          pdf.setDrawColor(...colors.border);
          pdf.setFillColor(...colors.white);
          pdf.setLineWidth(2);
          pdf.rect(xPos, yPos, photoWidth, photoHeight, 'FD');
          
          // Determinar formato da imagem
          const format = photoDataURL.includes('data:image/png') ? 'PNG' : 'JPEG';
          pdf.addImage(photoDataURL, format, xPos + 3, yPos + 3, photoWidth - 6, photoHeight - 6);
          
          // Photo caption with background
          pdf.setFillColor(...colors.titleBg);
          pdf.rect(xPos, yPos + photoHeight - 15, photoWidth, 15, 'F');
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...colors.titleText);
          const captionText = `Imagem ${i + 1}`;
          const captionWidth = pdf.getTextWidth(captionText);
          pdf.text(captionText, xPos + (photoWidth - captionWidth) / 2, yPos + photoHeight - 5);
          
          photoCount++;
        } catch (error) {
          console.error(`Erro ao processar foto ${i + 1}:`, error);
          // Add placeholder with error message
          pdf.setDrawColor(...colors.border);
          pdf.setFillColor(245, 245, 245);
          pdf.setLineWidth(1);
          pdf.rect(xPos, yPos, photoWidth, photoHeight, 'FD');
          
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`[Erro ao carregar]`, xPos + 15, yPos + 25);
          pdf.text(`Imagem ${i + 1}`, xPos + 20, yPos + 35);
          photoCount++;
        }
      }
    }
    
    // Update currentY after photos
    const rows = Math.ceil(proposalData.photos.length / photosPerRow);
    currentY += (rows * (photoHeight + photoSpacing + 20)) + 20;
  }

  // === RODAPÉ PROFISSIONAL - ASSINATURA NO FINAL DA PÁGINA ===
  // Go to the last page to add footer
  const totalPages = pdf.getNumberOfPages();
  pdf.setPage(totalPages);
  
  // Calculate bottom of page for signature
  const footerStartY = pageHeight - 70;
  const hasSignatures = !!(proposalData.technician_signature || proposalData.client_signature);
  const footerHeight = hasSignatures ? 60 : 35;
  
  // Add some spacing before signature section
  currentY = Math.max(currentY + 20, footerStartY - 40);
  
  // Signature section box
  pdf.setDrawColor(...colors.border);
  pdf.setFillColor(...colors.background);
  pdf.setLineWidth(1);
  pdf.rect(margin, footerStartY - 15, contentWidth, footerHeight, 'FD');
  
  if (hasSignatures) {
    const sigWidth = 70;
    const sigHeight = 40;
    const leftX = margin + 15;
    const rightX = pageWidth - margin - 15 - sigWidth;
    const sigY = footerStartY - 10;
    
    if (proposalData.technician_signature) {
      try {
        const sigData = await ensureDataURL(proposalData.technician_signature);
        const format = sigData.includes('data:image/png') ? 'PNG' : 'JPEG';
        pdf.addImage(sigData, format, leftX, sigY, sigWidth, sigHeight);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        const label = 'Assinatura do Técnico';
        const w = pdf.getTextWidth(label);
        pdf.text(label, leftX + (sigWidth - w) / 2, sigY + sigHeight + 10);
      } catch (e) {
        console.error('Erro ao adicionar assinatura do técnico:', e);
      }
    }
    
    if (proposalData.client_signature) {
      try {
        const sigData = await ensureDataURL(proposalData.client_signature);
        const format = sigData.includes('data:image/png') ? 'PNG' : 'JPEG';
        pdf.addImage(sigData, format, rightX, sigY, sigWidth, sigHeight);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        const label = 'Assinatura do Cliente';
        const w = pdf.getTextWidth(label);
        pdf.text(label, rightX + (sigWidth - w) / 2, sigY + sigHeight + 10);
      } catch (e) {
        console.error('Erro ao adicionar assinatura do cliente:', e);
      }
    }
  } else {
    // Signature line (centered in the page)
    const signatureLineWidth = 80;
    const signatureX = (pageWidth - signatureLineWidth) / 2;
    const signatureY = footerStartY;
    
    pdf.setDrawColor(...colors.text);
    pdf.setLineWidth(1);
    pdf.line(signatureX, signatureY, signatureX + signatureLineWidth, signatureY);
    
    // Signature text (centered)
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.text);
    const signatureText = 'Assinatura e Carimbo do Responsável';
    const textWidth = pdf.getTextWidth(signatureText);
    pdf.text(signatureText, (pageWidth - textWidth) / 2, signatureY + 8);
    
    // Executor name if available
    if (proposalData.executor_name) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      const executorText = proposalData.executor_name;
      const executorWidth = pdf.getTextWidth(executorText);
      pdf.text(executorText, (pageWidth - executorWidth) / 2, signatureY - 5);
      
      if (proposalData.executor_title) {
        pdf.setFont('helvetica', 'normal');
        const titleText = proposalData.executor_title;
        const titleWidth = pdf.getTextWidth(titleText);
        pdf.text(titleText, (pageWidth - titleWidth) / 2, signatureY - 12);
      }
    }
  }

  // Closing message
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(...colors.primary);
  const closingText = 'Agradecemos a preferência. Estamos à disposição para dúvidas e ajustes.';
  const closingWidth = pdf.getTextWidth(closingText);
  pdf.text(closingText, (pageWidth - closingWidth) / 2, pageHeight - 25);

  // Company footer (centered)
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  const footerText = 'Documento gerado automaticamente pelo Sistema Evolutec';
  const footerWidth = pdf.getTextWidth(footerText);
  pdf.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 15);

  // Save the PDF with proper filename or return blob URL for preview
  const fileName = `Proposta_${proposalData.proposal_number.replace(/[^a-zA-Z0-9]/g, '_')}_${proposalData.clients?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Cliente'}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
  
  if (isPreview) {
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    return blobUrl;
  } else {
    pdf.save(fileName);
  }
};
