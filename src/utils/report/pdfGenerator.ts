import jsPDF from 'jspdf';
import { ReportData } from './types';
import type { PDFCustomizationOptions } from '@/components/pdf/PDFCustomizationModal';

const convertFileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const isDataURL = (value: string) => value.startsWith('data:');

const fetchToDataURL = async (url: string): Promise<string> => {
  const res = await fetch(url);
  const blob = await res.blob();
  return await convertFileToDataURL(new File([blob], 'image', { type: blob.type || 'image/jpeg' }));
};

const ensureDataURL = async (input: string | File): Promise<string> => {
  if (input instanceof File) return convertFileToDataURL(input);
  if (isDataURL(input)) return input;
  return await fetchToDataURL(input);
};

const getFormatFromDataURL = (dataURL: string): 'PNG' | 'JPEG' => {
  return dataURL.startsWith('data:image/png') ? 'PNG' : 'JPEG';
};

export const generateReportPDF = async (reportData: ReportData, customOptions?: PDFCustomizationOptions, isPreview = false): Promise<void | string> => {
  const pdf = new jsPDF();
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Configurações padrão ou personalizadas
  const options = customOptions || {
    fontFamily: 'Arial',
    fontSize: 12,
    fontStyle: 'normal',
    headerBackgroundColor: '#22c55e',
    headerTextColor: '#ffffff',
    titleBackgroundColor: '#1f2937',
    titleTextColor: '#ffffff',
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
  
  let yPosition = 20;
  
  // Cabeçalho com logo e dados da empresa
  if (reportData.company_logo || reportData.company_name) {
    // Logo na esquerda (se houver)
    if (reportData.company_logo) {
      try {
        let logoDataURL: string;
        
        if (reportData.company_logo instanceof File) {
          logoDataURL = await convertFileToDataURL(reportData.company_logo);
        } else {
          logoDataURL = await ensureDataURL(reportData.company_logo);
        }
        
        const logoFormat = getFormatFromDataURL(logoDataURL);
        const logoScale = customOptions?.logoScale || 1;
        const logoWidth = 30 * logoScale;
        const logoHeight = 20 * logoScale;
        
        // Calcular posição X baseada na opção de posição
        let logoX = margin; // Posição padrão à esquerda
        const logoPosition = customOptions?.logoPosition || 'left';
        
        if (logoPosition === 'center') {
          logoX = (pageWidth - logoWidth) / 2;
        } else if (logoPosition === 'right') {
          logoX = pageWidth - margin - logoWidth;
        }
        
        // Adicionar o logo ao PDF com escala e posição personalizadas
        pdf.addImage(logoDataURL, logoFormat, logoX, yPosition - 5, logoWidth, logoHeight);
      } catch (error) {
        console.log('Logo não pôde ser carregado:', error);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text('[LOGO]', margin, yPosition);
      }
    }
    
    // Nome da empresa na direita
    if (reportData.company_name) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      const companyNameWidth = pdf.getTextWidth(reportData.company_name);
      pdf.text(reportData.company_name, pageWidth - margin - companyNameWidth, yPosition);
      
      yPosition += 8;
      
      // Dados adicionais da empresa (alinhados à direita)
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      if (reportData.company_address) {
        const addressWidth = pdf.getTextWidth(reportData.company_address);
        pdf.text(reportData.company_address, pageWidth - margin - addressWidth, yPosition);
        yPosition += 6;
      }
      
      if (reportData.company_phone) {
        const phoneWidth = pdf.getTextWidth(reportData.company_phone);
        pdf.text(reportData.company_phone, pageWidth - margin - phoneWidth, yPosition);
        yPosition += 6;
      }
      
      if (reportData.company_email) {
        const emailWidth = pdf.getTextWidth(reportData.company_email);
        pdf.text(reportData.company_email, pageWidth - margin - emailWidth, yPosition);
        yPosition += 6;
      }
      
      // CNPJ da empresa
      if (reportData.cnpj) {
        const cnpjWidth = pdf.getTextWidth(`CNPJ: ${reportData.cnpj}`);
        pdf.text(`CNPJ: ${reportData.cnpj}`, pageWidth - margin - cnpjWidth, yPosition);
        yPosition += 6;
      }
    }
    
    yPosition += 15;
  }
  
  // Linha separadora
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 15;
  
  // Título do relatório centralizado e destacado
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  const titleWidth = pdf.getTextWidth('RELATÓRIO DE SERVIÇO');
  const titleX = (pageWidth - titleWidth) / 2;
  pdf.text('RELATÓRIO DE SERVIÇO', titleX, yPosition);
  yPosition += 15;
  
  // Seção DADOS DO CLIENTE
  if (reportData.clients) {
    // Header section with background
    pdf.setFillColor(headerBgColor.r, headerBgColor.g, headerBgColor.b);
    pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 12, 'F');
    
    pdf.setTextColor(headerTextColor.r, headerTextColor.g, headerTextColor.b);
    pdf.setFontSize(options.fontSize);
    pdf.setFont(options.fontFamily.toLowerCase(), options.fontStyle === 'bold' ? 'bold' : 'normal');
    if (options.fontStyle === 'italic') pdf.setFont(options.fontFamily.toLowerCase(), 'italic');
    pdf.text('DADOS DO CLIENTE', margin + 5, yPosition + 5);
    pdf.setTextColor(0, 0, 0); // Reset para preto
    yPosition += 18;
    
    // Client information
    pdf.setFontSize(9);
    
    if (reportData.clients.name) {
      const nomeLabel = 'Nome:';
      pdf.setFont('helvetica', 'bold');
      pdf.text(nomeLabel, margin + 5, yPosition);
      pdf.setFont('helvetica', 'normal');
      const nomeLabelWidth = pdf.getTextWidth(nomeLabel);
      pdf.text(reportData.clients.name, margin + 5 + nomeLabelWidth + 2, yPosition);
      yPosition += 8;
    }
    
    if (reportData.clients.address) {
      const enderecoLabel = 'Endereço:';
      pdf.setFont('helvetica', 'bold');
      pdf.text(enderecoLabel, margin + 5, yPosition);
      pdf.setFont('helvetica', 'normal');
      const enderecoLabelWidth = pdf.getTextWidth(enderecoLabel);
      pdf.text(reportData.clients.address, margin + 5 + enderecoLabelWidth + 2, yPosition);
      yPosition += 8;
    }
    
    if (reportData.clients.city || reportData.clients.state) {
      const cidadeLabel = 'Cidade/Estado:';
      pdf.setFont('helvetica', 'bold');
      pdf.text(cidadeLabel, margin + 5, yPosition);
      pdf.setFont('helvetica', 'normal');
      
      let cityStateText = '';
      if (reportData.clients.city && reportData.clients.state) {
        cityStateText = `${reportData.clients.city}/${reportData.clients.state}`;
      } else if (reportData.clients.city) {
        cityStateText = reportData.clients.city;
      } else if (reportData.clients.state) {
        cityStateText = reportData.clients.state;
      }
      
      const cidadeLabelWidth = pdf.getTextWidth(cidadeLabel);
      pdf.text(cityStateText, margin + 5 + cidadeLabelWidth + 2, yPosition);
      yPosition += 8;
    }
    
    if (reportData.clients.phone) {
      const telefoneLabel = 'Telefone:';
      pdf.setFont('helvetica', 'bold');
      pdf.text(telefoneLabel, margin + 5, yPosition);
      pdf.setFont('helvetica', 'normal');
      const telefoneLabelWidth = pdf.getTextWidth(telefoneLabel);
      pdf.text(reportData.clients.phone, margin + 5 + telefoneLabelWidth + 2, yPosition);
      yPosition += 8;
    }
    
    if (reportData.clients.email) {
      const emailLabel = 'Email:';
      pdf.setFont('helvetica', 'bold');
      pdf.text(emailLabel, margin + 5, yPosition);
      pdf.setFont('helvetica', 'normal');
      const emailLabelWidth = pdf.getTextWidth(emailLabel);
      pdf.text(reportData.clients.email, margin + 5 + emailLabelWidth + 2, yPosition);
      yPosition += 8;
    }
    
    if (reportData.clients.contact_person) {
      const responsavelLabel = 'Responsável:';
      pdf.setFont('helvetica', 'bold');
      pdf.text(responsavelLabel, margin + 5, yPosition);
      pdf.setFont('helvetica', 'normal');
      const responsavelLabelWidth = pdf.getTextWidth(responsavelLabel);
      pdf.text(reportData.clients.contact_person, margin + 5 + responsavelLabelWidth + 2, yPosition);
      yPosition += 8;
    }
    
    if (reportData.clients.cnpj) {
      const cnpjLabel = 'CNPJ:';
      pdf.setFont('helvetica', 'bold');
      pdf.text(cnpjLabel, margin + 5, yPosition);
      pdf.setFont('helvetica', 'normal');
      const cnpjLabelWidth = pdf.getTextWidth(cnpjLabel);
      pdf.text(reportData.clients.cnpj, margin + 5 + cnpjLabelWidth + 2, yPosition);
      yPosition += 8;
    }
    
    if (reportData.clients.zip_code) {
      const cepLabel = 'CEP:';
      pdf.setFont('helvetica', 'bold');
      pdf.text(cepLabel, margin + 5, yPosition);
      pdf.setFont('helvetica', 'normal');
      const cepLabelWidth = pdf.getTextWidth(cepLabel);
      pdf.text(reportData.clients.zip_code, margin + 5 + cepLabelWidth + 2, yPosition);
      yPosition += 8;
    }
    
    yPosition += 10;
  }
  
  // Seção INFORMAÇÕES DO RELATÓRIO
  pdf.setFillColor(headerBgColor.r, headerBgColor.g, headerBgColor.b);
  pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 12, 'F');
  
  pdf.setTextColor(headerTextColor.r, headerTextColor.g, headerTextColor.b);
  pdf.setFontSize(options.fontSize);
  pdf.setFont(options.fontFamily.toLowerCase(), options.fontStyle === 'bold' ? 'bold' : 'normal');
  if (options.fontStyle === 'italic') pdf.setFont(options.fontFamily.toLowerCase(), 'italic');
  pdf.text('INFORMAÇÕES DO RELATÓRIO', margin + 3, yPosition + 5);
  pdf.setTextColor(0, 0, 0); // Reset para preto
  yPosition += 18;
  
  // Report information
  pdf.setFontSize(9);
  
  if (reportData.title) {
    const tituloLabel = 'Título:';
    pdf.setFont('helvetica', 'bold');
    pdf.text(tituloLabel, margin + 3, yPosition);
    pdf.setFont('helvetica', 'normal');
    const tituloLabelWidth = pdf.getTextWidth(tituloLabel);
    pdf.text(reportData.title, margin + 3 + tituloLabelWidth + 2, yPosition);
    yPosition += 6;
  }
  
  const dataRelatorioLabel = 'Data do Relatório:';
  pdf.setFont('helvetica', 'bold');
  pdf.text(dataRelatorioLabel, margin + 3, yPosition);
  pdf.setFont('helvetica', 'normal');
  const dataRelatorioLabelWidth = pdf.getTextWidth(dataRelatorioLabel);
  pdf.text(new Date(reportData.report_date).toLocaleDateString('pt-BR'), margin + 3 + dataRelatorioLabelWidth + 2, yPosition);
  yPosition += 6;
  
  const dataCriacaoLabel = 'Criado em:';
  pdf.setFont('helvetica', 'bold');
  pdf.text(dataCriacaoLabel, margin + 3, yPosition);
  pdf.setFont('helvetica', 'normal');
  const dataCriacaoLabelWidth = pdf.getTextWidth(dataCriacaoLabel);
  pdf.text(new Date(reportData.created_at).toLocaleDateString('pt-BR'), margin + 3 + dataCriacaoLabelWidth + 2, yPosition);
  yPosition += 10;
  
  // Seção DADOS DO RESPONSÁVEL
  if (reportData.full_name || reportData.position || reportData.department) {
    pdf.setFillColor(headerBgColor.r, headerBgColor.g, headerBgColor.b);
    pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 12, 'F');
    
    pdf.setTextColor(headerTextColor.r, headerTextColor.g, headerTextColor.b);
    pdf.setFontSize(options.fontSize);
    pdf.setFont(options.fontFamily.toLowerCase(), options.fontStyle === 'bold' ? 'bold' : 'normal');
    if (options.fontStyle === 'italic') pdf.setFont(options.fontFamily.toLowerCase(), 'italic');
    pdf.text('DADOS DO RESPONSÁVEL', margin + 3, yPosition + 5);
    pdf.setTextColor(0, 0, 0);
    yPosition += 18;
    
    pdf.setFontSize(9);
    
    if (reportData.full_name) {
      const nomeLabel = 'Nome Completo:';
      pdf.setFont('helvetica', 'bold');
      pdf.text(nomeLabel, margin + 3, yPosition);
      pdf.setFont('helvetica', 'normal');
      const nomeLabelWidth = pdf.getTextWidth(nomeLabel);
      pdf.text(reportData.full_name, margin + 3 + nomeLabelWidth + 2, yPosition);
      yPosition += 6;
    }
    
    if (reportData.position) {
      const cargoLabel = 'Cargo:';
      pdf.setFont('helvetica', 'bold');
      pdf.text(cargoLabel, margin + 3, yPosition);
      pdf.setFont('helvetica', 'normal');
      const cargoLabelWidth = pdf.getTextWidth(cargoLabel);
      pdf.text(reportData.position, margin + 3 + cargoLabelWidth + 2, yPosition);
      yPosition += 6;
    }
    
    if (reportData.department) {
      const deptLabel = 'Departamento:';
      pdf.setFont('helvetica', 'bold');
      pdf.text(deptLabel, margin + 3, yPosition);
      pdf.setFont('helvetica', 'normal');
      const deptLabelWidth = pdf.getTextWidth(deptLabel);
      pdf.text(reportData.department, margin + 3 + deptLabelWidth + 2, yPosition);
      yPosition += 6;
    }
    
    yPosition += 10;
  }
  
  // Equipamento (se houver)
  if (reportData.equipments) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Equipamento:', 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(reportData.equipments.name, 80, yPosition);
    yPosition += 10;
  }
  
  // Técnico (se houver)
  if (reportData.technicians) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('TÉCNICO RESPONSÁVEL:', 20, yPosition);
    yPosition += 10;
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nome: ${reportData.technicians.name}`, 20, yPosition);
    yPosition += 7;
    
    if (reportData.technicians.specialization) {
      pdf.text(`Especialização: ${reportData.technicians.specialization}`, 20, yPosition);
      yPosition += 7;
    }
    
    if (reportData.technicians.phone) {
      pdf.text(`Telefone: ${reportData.technicians.phone}`, 20, yPosition);
      yPosition += 7;
    }
    
    if (reportData.technicians.email) {
      pdf.text(`Email: ${reportData.technicians.email}`, 20, yPosition);
      yPosition += 7;
    }
    
    yPosition += 10;
  }
  
  // Descrição
  if (reportData.description) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('DESCRIÇÃO DAS ATIVIDADES:', 20, yPosition);
    yPosition += 10;
    
    pdf.setFont('helvetica', 'normal');
    const splitDescription = pdf.splitTextToSize(reportData.description, 170);
    pdf.text(splitDescription, 20, yPosition);
    yPosition += splitDescription.length * 5 + 15;
  }

  // URL do anexo
  if (reportData.attachment_url) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('ANEXO:', 20, yPosition);
    yPosition += 10;
    
    pdf.setFont('helvetica', 'normal');
    const splitUrl = pdf.splitTextToSize(reportData.attachment_url, 170);
    pdf.text(splitUrl, 20, yPosition);
    yPosition += splitUrl.length * 5 + 15;
  }

  // Fotos anexas
  console.log('🔍 Verificando fotos no relatório...', {
    hasPhotos: !!reportData.photos,
    isArray: Array.isArray(reportData.photos),
    length: reportData.photos?.length || 0,
    type: typeof reportData.photos,
    sample: reportData.photos?.slice(0, 2) || []
  });
  
  if (reportData.photos && Array.isArray(reportData.photos) && reportData.photos.length > 0) {
    console.log('Processando fotos no relatório:', reportData.photos.length, reportData.photos);
    // Verificar se precisamos de nova página
    if (yPosition > 200) {
      pdf.addPage();
      yPosition = 20;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(`FOTOS ANEXAS: ${reportData.photos.length} foto(s)`, 20, yPosition);
    yPosition += 15;
    
    // Processar e adicionar as fotos
    let photosProcessed = 0;
    const photosPerRow = 2;
    const photoWidth = 80;
    const photoHeight = 60;
    
    for (let i = 0; i < reportData.photos.length; i++) {
      const photo = reportData.photos[i];
      
      // Pular se a foto estiver vazia ou inválida
      if (!photo || (typeof photo === 'string' && photo.trim() === '')) {
        console.warn(`Foto ${i + 1} está vazia, pulando...`);
        continue;
      }
      
      let photoDataURL: string;
      
      try {
        if (photo instanceof File) {
          photoDataURL = await convertFileToDataURL(photo);
        } else if (typeof photo === 'string') {
          // Se já é uma DataURL, usar diretamente
          if (photo.startsWith('data:image/')) {
            photoDataURL = photo;
          } else {
            // Se é uma URL, fazer fetch
            photoDataURL = await ensureDataURL(photo);
          }
        } else {
          console.warn(`Tipo de foto não suportado para foto ${i + 1}:`, typeof photo);
          continue;
        }
        
        const col = photosProcessed % photosPerRow;
        const xPosition = 20 + (col * (photoWidth + 10));
        
        // Verificar se precisamos de nova página
        if (yPosition + photoHeight > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const imgFormat = getFormatFromDataURL(photoDataURL);
        pdf.addImage(photoDataURL, imgFormat, xPosition, yPosition, photoWidth, photoHeight);
        
        // Adicionar número da foto
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Foto ${photosProcessed + 1}`, xPosition, yPosition + photoHeight + 5);
        
        photosProcessed++;
        
        // Mover para próxima linha após 2 fotos
        if (photosProcessed % photosPerRow === 0) {
          yPosition += photoHeight + 15;
        }
      } catch (error) {
        console.error(`Erro ao processar foto ${i + 1}:`, error);
        console.log('Dados da foto:', photo);
        
        // Adicionar placeholder para foto com erro
        const col = photosProcessed % photosPerRow;
        const xPosition = 20 + (col * (photoWidth + 10));
        
        // Verificar se precisamos de nova página
        if (yPosition + photoHeight > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Desenhar retângulo com texto de erro
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(xPosition, yPosition, photoWidth, photoHeight);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Foto não disponível', xPosition + 5, yPosition + photoHeight / 2);
        pdf.text(`Foto ${photosProcessed + 1}`, xPosition, yPosition + photoHeight + 5);
        
        photosProcessed++;
        
        // Mover para próxima linha após 2 fotos
        if (photosProcessed % photosPerRow === 0) {
          yPosition += photoHeight + 15;
        }
      }
    }
    
    // Ajustar posição final se não completou uma linha
    if (photosProcessed % photosPerRow !== 0) {
      yPosition += photoHeight + 15;
    }
    
    // Log para debug
    console.log(`Processadas ${photosProcessed} fotos de ${reportData.photos.length} total`);
  }
  
  // Verificar se não há fotos mas pode haver outros campos de anexos
  if (!reportData.photos || !Array.isArray(reportData.photos) || reportData.photos.length === 0) {
    console.log('Nenhuma foto encontrada no relatório. Dados disponíveis:', Object.keys(reportData));
    console.log('Campo photos:', reportData.photos);
  }

  // Seção de Assinaturas - sempre no final da folha
  if (reportData.technician_signature || reportData.client_signature) {
    // Verificar se precisamos de nova página para as assinaturas
    if (yPosition > 150) {
      pdf.addPage();
      yPosition = 20;
    } else {
      yPosition += 20;
    }

    pdf.setFillColor(headerBgColor.r, headerBgColor.g, headerBgColor.b);
    pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 12, 'F');
    
    pdf.setTextColor(headerTextColor.r, headerTextColor.g, headerTextColor.b);
    pdf.setFontSize(options.fontSize);
    pdf.setFont(options.fontFamily.toLowerCase(), options.fontStyle === 'bold' ? 'bold' : 'normal');
    pdf.text('ASSINATURAS', margin + 3, yPosition + 5);
    pdf.setTextColor(0, 0, 0); // Reset para preto
    yPosition += 18;

    const sigHeight = 60;
    const sigWidth = (pageWidth - 2 * margin - 20) / 2;

    // Assinatura do Técnico
    if (reportData.technician_signature) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Assinatura do Técnico:', margin, yPosition);
      yPosition += 10;

      try {
        const sigFormat = getFormatFromDataURL(reportData.technician_signature);
        pdf.addImage(reportData.technician_signature, sigFormat, margin, yPosition, sigWidth, sigHeight);
      } catch (error) {
        console.error('Erro ao processar assinatura do técnico:', error);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text('[Assinatura do Técnico não disponível]', margin, yPosition + 20);
      }
    } else {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Assinatura do Técnico:', margin, yPosition);
      yPosition += 10;
      pdf.rect(margin, yPosition, sigWidth, sigHeight);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('_'.repeat(30), margin + 5, yPosition + sigHeight + 10);
    }

    // Assinatura do Cliente
    if (reportData.client_signature) {
      const clientXPosition = margin + sigWidth + 20;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Assinatura do Cliente:', clientXPosition, yPosition - 10);

      try {
        const sigFormat = getFormatFromDataURL(reportData.client_signature);
        pdf.addImage(reportData.client_signature, sigFormat, clientXPosition, yPosition, sigWidth, sigHeight);
      } catch (error) {
        console.error('Erro ao processar assinatura do cliente:', error);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text('[Assinatura do Cliente não disponível]', clientXPosition, yPosition + 20);
      }
    } else {
      const clientXPosition = margin + sigWidth + 20;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Assinatura do Cliente:', clientXPosition, yPosition - 10);
      
      pdf.rect(clientXPosition, yPosition, sigWidth, sigHeight);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('_'.repeat(30), clientXPosition + 5, yPosition + sigHeight + 10);
    }

    yPosition += sigHeight + 20;
    pdf.setTextColor(0, 0, 0);
    yPosition += 25;

    const signatureWidth = 70;
    const signatureHeight = 40;
    const signatureSpacing = 20;

    // Posicionar assinaturas lado a lado
    let currentX = margin + 10;

    // Assinatura do Técnico
    if (reportData.technician_signature) {
      try {
        const techSigData = await ensureDataURL(reportData.technician_signature as string);
        pdf.addImage(techSigData, getFormatFromDataURL(techSigData), currentX, yPosition, signatureWidth, signatureHeight);
        
        // Linha para assinatura
        pdf.line(currentX, yPosition + signatureHeight + 5, currentX + signatureWidth, yPosition + signatureHeight + 5);
        
        // Label
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        const techLabel = 'Assinatura do Técnico';
        const techLabelWidth = pdf.getTextWidth(techLabel);
        const techLabelX = currentX + (signatureWidth - techLabelWidth) / 2;
        pdf.text(techLabel, techLabelX, yPosition + signatureHeight + 12);
        
        currentX += signatureWidth + signatureSpacing;
      } catch (error) {
        console.error('Erro ao adicionar assinatura do técnico:', error);
      }
    }

    // Assinatura do Cliente
    if (reportData.client_signature) {
      try {
        const clientSigData = await ensureDataURL(reportData.client_signature as string);
        pdf.addImage(clientSigData, getFormatFromDataURL(clientSigData), currentX, yPosition, signatureWidth, signatureHeight);
        
        // Linha para assinatura
        pdf.line(currentX, yPosition + signatureHeight + 5, currentX + signatureWidth, yPosition + signatureHeight + 5);
        
        // Label
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        const clientLabel = 'Assinatura do Cliente';
        const clientLabelWidth = pdf.getTextWidth(clientLabel);
        const clientLabelX = currentX + (signatureWidth - clientLabelWidth) / 2;
        pdf.text(clientLabel, clientLabelX, yPosition + signatureHeight + 12);
      } catch (error) {
        console.error('Erro ao adicionar assinatura do cliente:', error);
      }
    }

    yPosition += signatureHeight + 20;
  }
  
  // Salvar o PDF ou retornar blob URL para preview
  const fileName = `relatorio_${reportData.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  
  if (isPreview) {
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    return blobUrl;
  } else {
    pdf.save(fileName);
  }
};
