import { useCallback } from 'react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PDFCustomizationOptions } from '@/components/pdf/PDFCustomizationModal';

export const useMaintenanceExportWithAttachments = () => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para limpar texto e evitar caracteres especiais
  const sanitizeText = (text: string): string => {
    if (!text) return '';
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '') // Remove caracteres especiais
      .trim();
  };

  const exportMaintenanceToPDF = useCallback(async (maintenanceOrder: any, customOptions?: PDFCustomizationOptions, isPreview = false) => {
    try {
      // Buscar anexos da manutenção
      const { data: attachments, error: attachmentsError } = await supabase
        .from('maintenance_attachments')
        .select('*')
        .eq('maintenance_order_id', maintenanceOrder.id);

      if (attachmentsError) {
        console.error('Erro ao buscar anexos:', attachmentsError);
      }

      // Buscar última execução para capturar dados completos
      const { data: execution, error: execError } = await supabase
        .from('maintenance_executions')
        .select('*')
        .eq('maintenance_order_id', maintenanceOrder.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Se temos dados de execução da props, usar eles
      const executionData = maintenanceOrder.execution || execution;

      if (execError) {
        console.error('Erro ao buscar execução:', execError);
      }

      // Buscar dados do usuário para logo
      const { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select('company_logo_url, company_name, brand_primary_color, brand_secondary_color')
        .eq('user_id', maintenanceOrder.user_id)
        .single();

      if (userError) {
        console.error('Erro ao buscar perfil do usuário:', userError);
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Configuração adequada de encoding
      pdf.setFont('helvetica');
      pdf.setCharSpace(0);
      pdf.setR2L(false);
      
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      
      let currentY = margin;

      // Helper para converter hex para RGB
      const hexToRgb = (hex: string): [number, number, number] => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ] : [34, 197, 94]; // Verde padrão se conversão falhar
      };

      // Cores personalizáveis com base nas opções ou perfil do usuário
      const defaultColors = {
        primary: userProfile?.brand_primary_color ? hexToRgb(userProfile.brand_primary_color) : [34, 197, 94] as [number, number, number],
        secondary: userProfile?.brand_secondary_color ? hexToRgb(userProfile.brand_secondary_color) : [22, 163, 74] as [number, number, number],
        background: [248, 249, 250] as [number, number, number],
        text: [33, 33, 33] as [number, number, number],
        border: [224, 224, 224] as [number, number, number],
        white: [255, 255, 255] as [number, number, number],
        darkGray: [48, 48, 48] as [number, number, number]
      };

      // Aplicar customizações se fornecidas
      const colors = {
        primary: customOptions?.headerBackgroundColor ? hexToRgb(customOptions.headerBackgroundColor) : defaultColors.primary,
        secondary: customOptions?.titleBackgroundColor ? hexToRgb(customOptions.titleBackgroundColor) : defaultColors.secondary,
        headerText: customOptions?.headerTextColor ? hexToRgb(customOptions.headerTextColor) : defaultColors.white,
        titleText: customOptions?.titleTextColor ? hexToRgb(customOptions.titleTextColor) : defaultColors.white,
        background: defaultColors.background,
        text: defaultColors.text,
        border: defaultColors.border,
        white: defaultColors.white,
        darkGray: defaultColors.darkGray
      };

      // Configurações de fonte (normalizadas para jsPDF)
      const fontFamilyRaw = customOptions?.fontFamily || 'helvetica';
      const normalizeFontFamily = (name: string) => {
        const n = (name || '').toLowerCase();
        if (n.includes('arial') || n.includes('helvetica')) return 'helvetica';
        if (n.includes('times')) return 'times';
        if (n.includes('courier')) return 'courier';
        return 'helvetica';
      };
      const fontFamily = normalizeFontFamily(fontFamilyRaw);
      const fontSize = customOptions?.fontSize || 9;
      const fontStyleRaw = customOptions?.fontStyle || 'normal';
      const normalizeFontStyle = (style: string) => (['normal','bold','italic','bolditalic'].includes(style) ? style : 'normal');
      const fontStyle = normalizeFontStyle(fontStyleRaw);

      // Helper function para verificar nova página
      const checkNewPage = (requiredHeight: number) => {
        if (currentY + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
          return true;
        }
        return false;
      };

      // === CABEÇALHO COM LOGO ===
      if (userProfile?.company_logo_url && customOptions?.useLogoColor !== false) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve) => {
            img.onload = () => {
              try {
                const logoScale = customOptions?.logoScale || 1;
                const logoHeight = 20 * logoScale;
                const logoWidth = (img.width / img.height) * logoHeight;
                pdf.addImage(img, 'PNG', margin, currentY, logoWidth, logoHeight);
                currentY += logoHeight + 5;
              } catch (error) {
                console.error('Erro ao adicionar logo:', error);
              }
              resolve(void 0);
            };
            img.onerror = () => resolve(void 0);
            img.src = userProfile.company_logo_url;
            setTimeout(() => resolve(void 0), 3000);
          });
        } catch (error) {
          console.error('Erro ao carregar logo:', error);
        }
      }

      // === TÍTULO PRINCIPAL ===
      pdf.setFontSize(16);
      pdf.setFont(fontFamily, 'bold');
      pdf.setTextColor(...colors.primary);
      pdf.text(sanitizeText('RELATORIO DE MANUTENCAO'), margin, currentY);
      currentY += 10;

      // Data e número da O.S. alinhados à direita
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      const dateText = new Date().toLocaleDateString('pt-BR');
      const osNumber = sanitizeText(`O.S. No ${maintenanceOrder.order_number || maintenanceOrder.id.slice(-8)}`);
      
      const dateWidth = pdf.getTextWidth(sanitizeText(`Data: ${dateText}`));
      const osWidth = pdf.getTextWidth(osNumber);
      
      pdf.text(sanitizeText(`Data: ${dateText}`), pageWidth - margin - dateWidth, currentY);
      pdf.text(osNumber, pageWidth - margin - osWidth, currentY + 6);
      currentY += 20;

      // === FAIXA DE TÍTULO ===
      pdf.setFillColor(...colors.secondary);
      pdf.rect(margin, currentY, contentWidth, 15, 'F');
      
      pdf.setFontSize(14);
      pdf.setFont(fontFamily, 'bold');
      pdf.setTextColor(...colors.titleText);
      const titleText = sanitizeText('ORDEM DE SERVICO - MANUTENCAO');
      const titleWidth = pdf.getTextWidth(titleText);
      pdf.text(titleText, (pageWidth - titleWidth) / 2, currentY + 10);
      currentY += 25;

      // === INFORMAÇÕES BÁSICAS ===
      checkNewPage(50);
      
      pdf.setFillColor(...colors.primary);
      pdf.rect(margin, currentY, contentWidth, 12, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont(fontFamily, 'bold');
      pdf.setTextColor(...colors.headerText);
      pdf.text(sanitizeText('INFORMACOES GERAIS'), margin + 5, currentY + 8);
      currentY += 18;

      // Box para informações básicas
      const infoBoxHeight = 70;
      pdf.setDrawColor(...colors.border);
      pdf.setFillColor(...colors.background);
      pdf.setLineWidth(1);
      pdf.rect(margin, currentY, contentWidth, infoBoxHeight, 'FD');

      pdf.setFontSize(fontSize);
      pdf.setFont(fontFamily, fontStyle);
      pdf.setTextColor(...colors.text);
      
      let infoY = currentY + 10;
      
      // Status e Tipo na mesma linha (espaçamento melhorado)
      pdf.setFont(fontFamily, 'bold');
      pdf.text(sanitizeText('Status:'), margin + 5, infoY);
      pdf.setFont(fontFamily, fontStyle);
      const statusLabels: { [key: string]: string } = {
        'completed': 'Concluida',
        'in_progress': 'Em Andamento',
        'pending': 'Pendente',
        'cancelled': 'Cancelada'
      };
      pdf.text(sanitizeText(statusLabels[maintenanceOrder.status] || maintenanceOrder.status), margin + 25, infoY);
      
      pdf.setFont(fontFamily, 'bold');
      pdf.text(sanitizeText('Tipo:'), margin + 90, infoY);
      pdf.setFont(fontFamily, fontStyle);
      const typeLabels: { [key: string]: string } = {
        'preventive': 'Preventiva',
        'corrective': 'Corretiva',
        'emergency': 'Emergencial'
      };
      pdf.text(sanitizeText(typeLabels[maintenanceOrder.maintenance_type] || maintenanceOrder.maintenance_type), margin + 105, infoY);
      infoY += 12;

      // Prioridade (espaçamento melhorado)
      pdf.setFont(fontFamily, 'bold');
      pdf.text(sanitizeText('Prioridade:'), margin + 5, infoY);
      pdf.setFont(fontFamily, fontStyle);
      const priorityLabels: { [key: string]: string } = {
        'low': 'Baixa',
        'medium': 'Media',
        'high': 'Alta',
        'urgent': 'Urgente'
      };
      pdf.text(sanitizeText(priorityLabels[maintenanceOrder.priority] || maintenanceOrder.priority), margin + 35, infoY);
      infoY += 12;

      // Data de criação e Data agendada na mesma linha (espaçamento melhorado)
      pdf.setFont(fontFamily, 'bold');
      pdf.text(sanitizeText('Data de Criacao:'), margin + 5, infoY);
      pdf.setFont(fontFamily, fontStyle);
      pdf.text(new Date(maintenanceOrder.created_at).toLocaleDateString('pt-BR'), margin + 45, infoY);
      
      if (maintenanceOrder.scheduled_date) {
        pdf.setFont(fontFamily, 'bold');
        pdf.text(sanitizeText('Data Agendada:'), margin + 90, infoY);
        pdf.setFont(fontFamily, fontStyle);
        pdf.text(new Date(maintenanceOrder.scheduled_date).toLocaleDateString('pt-BR'), margin + 130, infoY);
      }
      infoY += 12;

      // Última atualização (espaçamento melhorado)
      pdf.setFont(fontFamily, 'bold');
      pdf.text(sanitizeText('Ultima Atualizacao:'), margin + 5, infoY);
      pdf.setFont(fontFamily, fontStyle);
      pdf.text(new Date(maintenanceOrder.updated_at).toLocaleDateString('pt-BR'), margin + 55, infoY);
      
      currentY += infoBoxHeight + 15;

      // === EQUIPAMENTO ===
      checkNewPage(40);
      
      pdf.setFillColor(...colors.primary);
      pdf.rect(margin, currentY, contentWidth, 12, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont(fontFamily, 'bold');
      pdf.setTextColor(...colors.headerText);
      pdf.text(sanitizeText('EQUIPAMENTO'), margin + 5, currentY + 8);
      currentY += 18;

      const equipBoxHeight = 50;
      pdf.setDrawColor(...colors.border);
      pdf.setFillColor(...colors.background);
      pdf.setLineWidth(1);
      pdf.rect(margin, currentY, contentWidth, equipBoxHeight, 'FD');

      pdf.setFontSize(fontSize);
      pdf.setFont(fontFamily, fontStyle);
      pdf.setTextColor(...colors.text);
      
      let equipY = currentY + 10;
      
      if (maintenanceOrder.equipments) {
        pdf.setFont(fontFamily, 'bold');
        pdf.text(sanitizeText('Nome:'), margin + 5, equipY);
        pdf.setFont(fontFamily, fontStyle);
        pdf.text(sanitizeText(maintenanceOrder.equipments.name || 'N/A'), margin + 25, equipY);
        equipY += 12;

        if (maintenanceOrder.equipments.installation_location) {
          pdf.setFont(fontFamily, 'bold');
          pdf.text(sanitizeText('Local:'), margin + 5, equipY);
          pdf.setFont(fontFamily, fontStyle);
          pdf.text(sanitizeText(maintenanceOrder.equipments.installation_location), margin + 22, equipY);
          equipY += 12;
        }

        if (maintenanceOrder.equipments.serial_number) {
          pdf.setFont(fontFamily, 'bold');
          pdf.text(sanitizeText('Serie:'), margin + 5, equipY);
          pdf.setFont(fontFamily, fontStyle);
          pdf.text(sanitizeText(maintenanceOrder.equipments.serial_number), margin + 22, equipY);
        }
      } else {
        pdf.text(sanitizeText('Equipamento nao identificado'), margin + 5, equipY);
      }
      
      currentY += equipBoxHeight + 15;

      // === DESCRIÇÃO ===
      checkNewPage(40);
      
      pdf.setFillColor(...colors.primary);
      pdf.rect(margin, currentY, contentWidth, 12, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont(fontFamily, 'bold');
      pdf.setTextColor(...colors.headerText);
      pdf.text(sanitizeText('DESCRICAO DO SERVICO'), margin + 5, currentY + 8);
      currentY += 18;

      const description = sanitizeText(maintenanceOrder.description || 'Sem descricao disponivel');
      const splitDescription = pdf.splitTextToSize(description, contentWidth - 20); // Margem interna maior
      const descBoxHeight = Math.max(40, splitDescription.length * 6 + 20); // Altura mínima maior
      
      pdf.setDrawColor(...colors.border);
      pdf.setFillColor(...colors.background);
      pdf.setLineWidth(1);
      pdf.rect(margin, currentY, contentWidth, descBoxHeight, 'FD');

      pdf.setFontSize(fontSize);
      pdf.setFont(fontFamily, fontStyle);
      pdf.setTextColor(...colors.text);
      pdf.text(splitDescription, margin + 10, currentY + 15); // Margem interna melhorada
      
      currentY += descBoxHeight + 15;

      // === CHECKLIST EXECUTADO ===
      if (executionData?.checklist_items && Array.isArray(executionData.checklist_items) && executionData.checklist_items.length > 0) {
        checkNewPage(40);
        
        pdf.setFillColor(...colors.primary);
        pdf.rect(margin, currentY, contentWidth, 12, 'F');
        
        pdf.setFontSize(12);
        pdf.setFont(fontFamily, 'bold');
        pdf.setTextColor(...colors.headerText);
        pdf.text(sanitizeText('CHECKLIST EXECUTADO'), margin + 5, currentY + 8);
        currentY += 18;

        // Calcular altura necessária para o checklist incluindo anexos
        let checklistHeight = 20;
        executionData.checklist_items.forEach((item: any) => {
          checklistHeight += 8;
          if (item && typeof item === 'object') {
            if (item.comment) {
              checklistHeight += 6; // Espaço extra para comentário
            }
            if (item.attachments && Array.isArray(item.attachments) && item.attachments.length > 0) {
              checklistHeight += item.attachments.length * 5 + 8; // Espaço para lista de anexos
            }
          }
        });

        checkNewPage(checklistHeight);

        pdf.setDrawColor(...colors.border);
        pdf.setFillColor(...colors.background);
        pdf.setLineWidth(1);
        pdf.rect(margin, currentY, contentWidth, checklistHeight, 'FD');

        pdf.setFontSize(fontSize);
        pdf.setFont(fontFamily, fontStyle);
        pdf.setTextColor(...colors.text);
        
        let checklistY = currentY + 10;
        
        for (const [index, item] of executionData.checklist_items.entries()) {
          if (typeof item === 'string') {
            pdf.text(sanitizeText(`• ${item}`), margin + 5, checklistY);
            checklistY += 8;
          } else if (item && typeof item === 'object') {
            const statusIcon = item.status === 'conforme' ? '✓' : item.status === 'nao_conforme' ? '✗' : '•';
            const statusLabel = item.status === 'conforme' ? ' (Conforme)' : item.status === 'nao_conforme' ? ' (Nao conforme)' : '';
            pdf.text(sanitizeText(`${statusIcon} ${item.item || item}${statusLabel}`), margin + 5, checklistY);
            checklistY += 8;
            
            if (item.comment) {
              pdf.setFont(fontFamily, 'italic');
              pdf.setFontSize(fontSize - 1);
              const commentText = sanitizeText(`    Observacao: ${item.comment}`);
              const splitComment = pdf.splitTextToSize(commentText, contentWidth - 30);
              pdf.text(splitComment, margin + 10, checklistY);
              checklistY += splitComment.length * 5 + 2;
              pdf.setFont(fontFamily, fontStyle);
              pdf.setFontSize(fontSize);
            }
            
            // Adicionar anexos do item do checklist
            if (item.attachments && Array.isArray(item.attachments) && item.attachments.length > 0) {
              pdf.setFont(fontFamily, 'bold');
              pdf.setFontSize(fontSize - 1);
              pdf.text(sanitizeText('    Anexos:'), margin + 10, checklistY);
              checklistY += 6;
              
              for (const [attachIndex, attachment] of item.attachments.entries()) {
                // Verificar se precisa de nova página
                if (checklistY > pageHeight - 80) {
                  pdf.addPage();
                  currentY = margin;
                  checklistY = currentY + 15;
                }
                
                pdf.setFont(fontFamily, fontStyle);
                const attachmentText = `      ${attachIndex + 1}. ${attachment.name || attachment.url || `Anexo ${attachIndex + 1}`}`;
                pdf.text(sanitizeText(attachmentText), margin + 15, checklistY);
                checklistY += 8;
                
                // Se for uma imagem, tentar incluir a prévia
                if (attachment.url && (attachment.url.includes('image') || attachment.url.includes('.jpg') || attachment.url.includes('.png') || attachment.url.includes('.jpeg'))) {
                  try {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    
                    const loadImage = () => new Promise<void>((resolve) => {
                      img.onload = () => {
                        try {
                          // Verificar se há espaço suficiente para a imagem
                          if (checklistY + 40 > pageHeight - 40) {
                            pdf.addPage();
                            currentY = margin;
                            checklistY = currentY + 15;
                          }
                          
                          // Calcular dimensões para caber no PDF
                          const maxWidth = 50;
                          const maxHeight = 35;
                          const aspectRatio = img.width / img.height;
                          
                          let imgWidth = maxWidth;
                          let imgHeight = maxWidth / aspectRatio;
                          
                          if (imgHeight > maxHeight) {
                            imgHeight = maxHeight;
                            imgWidth = maxHeight * aspectRatio;
                          }
                          
                          // Adicionar imagem ao PDF
                          pdf.addImage(
                            img,
                            'JPEG',
                            margin + 20,
                            checklistY,
                            imgWidth,
                            imgHeight
                          );
                          
                          checklistY += imgHeight + 5;
                          resolve();
                        } catch (error) {
                          console.error('Erro ao adicionar imagem do anexo ao PDF:', error);
                          resolve();
                        }
                      };
                      
                      img.onerror = () => {
                        console.error('Erro ao carregar imagem do anexo:', attachment.url);
                        resolve();
                      };
                      
                      // Tentar carregar a imagem
                      img.src = attachment.url;
                      
                      // Timeout para evitar travamento
                      setTimeout(() => resolve(), 3000);
                    });
                    
                    await loadImage();
                  } catch (error) {
                    console.error('Erro ao processar imagem do anexo:', error);
                  }
                }
              }
              
              pdf.setFontSize(fontSize);
              pdf.setFont(fontFamily, fontStyle);
              checklistY += 5; // Espaço extra após anexos
            }
          }
        }
        
        currentY += checklistHeight + 15;
      }

      // === OBSERVAÇÕES GERAIS ===
      if (executionData?.observations) {
        checkNewPage(40);
        
        pdf.setFillColor(...colors.primary);
        pdf.rect(margin, currentY, contentWidth, 12, 'F');
        
        pdf.setFontSize(12);
        pdf.setFont(fontFamily, 'bold');
        pdf.setTextColor(...colors.headerText);
        pdf.text(sanitizeText('OBSERVACOES GERAIS'), margin + 5, currentY + 8);
        currentY += 18;

        const observations = sanitizeText(executionData.observations);
        const splitObservations = pdf.splitTextToSize(observations, contentWidth - 20);
        const obsBoxHeight = Math.max(40, splitObservations.length * 6 + 20);
        
        pdf.setDrawColor(...colors.border);
        pdf.setFillColor(...colors.background);
        pdf.setLineWidth(1);
        pdf.rect(margin, currentY, contentWidth, obsBoxHeight, 'FD');

        pdf.setFontSize(fontSize);
        pdf.setFont(fontFamily, fontStyle);
        pdf.setTextColor(...colors.text);
        pdf.text(splitObservations, margin + 10, currentY + 15);
        
        currentY += obsBoxHeight + 15;
      }

      // === DATAS DE EXECUÇÃO ===
      if (executionData?.start_datetime || executionData?.end_datetime) {
        checkNewPage(30);
        
        pdf.setFillColor(...colors.primary);
        pdf.rect(margin, currentY, contentWidth, 12, 'F');
        
        pdf.setFontSize(12);
        pdf.setFont(fontFamily, 'bold');
        pdf.setTextColor(...colors.headerText);
        pdf.text(sanitizeText('DATAS DE EXECUCAO'), margin + 5, currentY + 8);
        currentY += 18;

        const datesBoxHeight = 35;
        pdf.setDrawColor(...colors.border);
        pdf.setFillColor(...colors.background);
        pdf.setLineWidth(1);
        pdf.rect(margin, currentY, contentWidth, datesBoxHeight, 'FD');

        pdf.setFontSize(fontSize);
        pdf.setFont(fontFamily, fontStyle);
        pdf.setTextColor(...colors.text);
        
        let datesY = currentY + 10;
        
        if (executionData.start_datetime) {
          pdf.setFont(fontFamily, 'bold');
          pdf.text(sanitizeText('Inicio:'), margin + 5, datesY);
          pdf.setFont(fontFamily, fontStyle);
          pdf.text(new Date(executionData.start_datetime).toLocaleString('pt-BR'), margin + 25, datesY);
          datesY += 12;
        }
        
        if (executionData.end_datetime) {
          pdf.setFont(fontFamily, 'bold');
          pdf.text(sanitizeText('Fim:'), margin + 5, datesY);
          pdf.setFont(fontFamily, fontStyle);
          pdf.text(new Date(executionData.end_datetime).toLocaleString('pt-BR'), margin + 25, datesY);
        }
        
        currentY += datesBoxHeight + 15;
      }

      // === TÉCNICO RESPONSÁVEL ===
      if (maintenanceOrder.technicians?.name) {
        checkNewPage(30);
        
        pdf.setFillColor(...colors.primary);
        pdf.rect(margin, currentY, contentWidth, 12, 'F');
        
        pdf.setFontSize(12);
        pdf.setFont(fontFamily, 'bold');
        pdf.setTextColor(...colors.headerText);
        pdf.text(sanitizeText('TECNICO RESPONSAVEL'), margin + 5, currentY + 8);
        currentY += 18;

        const techBoxHeight = 35;
        pdf.setDrawColor(...colors.border);
        pdf.setFillColor(...colors.background);
        pdf.setLineWidth(1);
        pdf.rect(margin, currentY, contentWidth, techBoxHeight, 'FD');

        pdf.setFontSize(fontSize);
        pdf.setFont(fontFamily, fontStyle);
        pdf.setTextColor(...colors.text);
        
        let techY = currentY + 10;
        pdf.setFont(fontFamily, 'bold');
        pdf.text(sanitizeText('Nome:'), margin + 5, techY);
        pdf.setFont(fontFamily, fontStyle);
        pdf.text(sanitizeText(maintenanceOrder.technicians.name), margin + 22, techY);
        
        if (maintenanceOrder.technicians.email) {
          techY += 12;
          pdf.setFont(fontFamily, 'bold');
          pdf.text(sanitizeText('Email:'), margin + 5, techY);
          pdf.setFont(fontFamily, fontStyle);
          pdf.text(sanitizeText(maintenanceOrder.technicians.email), margin + 22, techY);
        }
        
        currentY += techBoxHeight + 15;
      }

      // === ANEXOS E EVIDÊNCIAS ===
      checkNewPage(40);
      
      pdf.setFillColor(...colors.primary);
      pdf.rect(margin, currentY, contentWidth, 12, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont(fontFamily, 'bold');
      pdf.setTextColor(...colors.headerText);
      pdf.text(sanitizeText('ANEXOS E EVIDENCIAS'), margin + 5, currentY + 8);
      currentY += 18;

      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          checkNewPage(80);
          
          // Box para cada anexo
          const attachmentBoxHeight = 70;
          pdf.setDrawColor(...colors.border);
          pdf.setFillColor(...colors.background);
          pdf.setLineWidth(1);
          pdf.rect(margin, currentY, contentWidth, attachmentBoxHeight, 'FD');

          // Nome do arquivo e tipo
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...colors.text);
          pdf.text(sanitizeText(`Arquivo: ${attachment.file_name}`), margin + 5, currentY + 10);
          
          pdf.setFont('helvetica', 'normal');
          pdf.text(sanitizeText(`Tipo: ${attachment.file_type === 'photo' ? 'Foto' : 'Video'}`), margin + 5, currentY + 18);
          
          if (attachment.comment) {
            pdf.text(sanitizeText(`Comentario: ${attachment.comment}`), margin + 5, currentY + 26);
          }

          // Para imagens, tentar incluir a imagem
          if (attachment.file_type === 'photo') {
            try {
              // Obter URL pública da imagem
              const { data: urlData } = supabase.storage
                .from('maintenance-attachments')
                .getPublicUrl(attachment.file_path);

              if (urlData?.publicUrl) {
                // Tentar carregar a imagem
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                await new Promise((resolve, reject) => {
                  img.onload = () => {
                    try {
                      // Calcular dimensões para caber no box
                      const maxWidth = 60;
                      const maxHeight = 35;
                      const aspectRatio = img.width / img.height;
                      
                      let imgWidth = maxWidth;
                      let imgHeight = maxWidth / aspectRatio;
                      
                      if (imgHeight > maxHeight) {
                        imgHeight = maxHeight;
                        imgWidth = maxHeight * aspectRatio;
                      }
                      
                      // Adicionar imagem ao PDF
                      pdf.addImage(
                        img,
                        'JPEG',
                        margin + 100, // Posição X
                        currentY + 5, // Posição Y
                        imgWidth,
                        imgHeight
                      );
                      resolve(void 0);
                    } catch (error) {
                      console.error('Erro ao adicionar imagem ao PDF:', error);
                      resolve(void 0);
                    }
                  };
                  
                  img.onerror = () => {
                    console.error('Erro ao carregar imagem:', urlData.publicUrl);
                    resolve(void 0);
                  };
                  
                  img.src = urlData.publicUrl;
                  
                  // Timeout para evitar travamento
                  setTimeout(() => resolve(void 0), 5000);
                });
              }
            } catch (error) {
              console.error('Erro ao processar imagem:', error);
            }
          }
          
          currentY += attachmentBoxHeight + 10;
        }
      } else {
        const noAttachBoxHeight = 30;
        pdf.setDrawColor(...colors.border);
        pdf.setFillColor(...colors.background);
        pdf.setLineWidth(1);
        pdf.rect(margin, currentY, contentWidth, noAttachBoxHeight, 'FD');

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...colors.text);
        pdf.text(sanitizeText('Nenhum anexo encontrado para esta manutencao.'), margin + 5, currentY + 15);
        
        currentY += noAttachBoxHeight + 20;
      }

      // === ASSINATURAS ===
      checkNewPage(120);
      
      pdf.setFillColor(...colors.primary);
      pdf.rect(margin, currentY, contentWidth, 12, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont(fontFamily, 'bold');
      pdf.setTextColor(...colors.headerText);
      pdf.text(sanitizeText('ASSINATURA'), margin + 5, currentY + 8);
      currentY += 18;

      const sigBoxHeight = 60; // Altura reduzida para apenas uma assinatura
      pdf.setDrawColor(...colors.border);
      pdf.setFillColor(...colors.background);
      pdf.setLineWidth(1);
      pdf.rect(margin, currentY, contentWidth, sigBoxHeight, 'FD');

      const sigWidth = contentWidth - 20; // Largura total para apenas uma assinatura
      const sigHeight = 35;
      const sigX = margin + 10; // Centralizada
      const sigY = currentY + 15;

      const getImgFormat = (data: string) => data.startsWith('data:image/png') ? 'PNG' : 'JPEG';

      // Assinatura do técnico: usar a assinatura digital (desenho) como imagem
      if (executionData?.digital_signature) {
        try {
          const imgFormat = getImgFormat(executionData.digital_signature);
          pdf.addImage(executionData.digital_signature, imgFormat, sigX, sigY, sigWidth, sigHeight);
        } catch (error) {
          console.error('Erro ao adicionar assinatura digital do técnico:', error);
          // Placeholder textual
          pdf.setFontSize(fontSize);
          pdf.setFont(fontFamily, 'normal');
          pdf.setTextColor(...colors.text);
          pdf.text(sanitizeText('Assinatura digital do técnico registrada'), sigX + 5, sigY + 20);
        }
      } else {
        // Placeholder textual quando não houver assinatura digital
        pdf.setFontSize(fontSize);
        pdf.setFont(fontFamily, 'normal');
        pdf.setTextColor(...colors.text);
        pdf.text(sanitizeText('Assinatura digital não disponível'), sigX + 5, sigY + 20);
      }
      
      // Nome do técnico abaixo da assinatura
      pdf.setFontSize(fontSize);
      pdf.setFont(fontFamily, 'bold');
      pdf.setTextColor(...colors.text);
      const techName = sanitizeText(executionData?.technician_signature || maintenanceOrder?.technicians?.name || 'Técnico Responsável');
      const techLabelWidth = pdf.getTextWidth(techName);
      pdf.text(techName, sigX + (sigWidth - techLabelWidth) / 2, sigY + sigHeight + 8);

      currentY += sigBoxHeight + 15;

      // === RODAPÉ ===
      const footerY = pageHeight - 20;
      pdf.setFontSize(8);
      pdf.setTextColor(...colors.text);
      pdf.text(sanitizeText('Documento gerado automaticamente pelo Sistema Evolutec'), margin, footerY);
      pdf.text(sanitizeText(`Gerado em: ${new Date().toLocaleString('pt-BR')}`), pageWidth - margin - 50, footerY);

      // Salvar arquivo ou retornar para preview
      const fileName = `OS_${maintenanceOrder.order_number || maintenanceOrder.id.slice(-8)}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      
      if (isPreview) {
        // Para preview, retornar como blob URL
        const pdfBlob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        return blobUrl;
      } else {
        // Para download, salvar normalmente
        pdf.save(fileName);
        toast.success('PDF da O.S. exportado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF da manutenção:', error);
      toast.error('Erro ao gerar PDF da manutenção');
    }
  }, []);

  return { exportMaintenanceToPDF };
};