
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface MaintenanceExecutionData {
  equipment_id: string;
  maintenance_type: string;
  technician_signature: string;
  observations: string;
  digital_signature: string;
  checklist_items: any[];
  periodicity?: string;
  maintenance_order_id?: string;
  attachments?: Array<{file: File, comment: string, type: 'photo' | 'video'}>;
  start_datetime?: string;
  end_datetime?: string;
}

export const useCreateMaintenanceExecution = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: async (data: MaintenanceExecutionData) => {
      console.log('🔍 Iniciando criação da execução de manutenção:', data);
      
      // Verificar se é acesso de campo (técnico) ou usuário autenticado
      const fieldSession = localStorage.getItem('field_session');
      let userId = null;
      let createdViaRPC = false;
      let fieldTechnicianId: string | null = null;
      let maintenanceOrderId: string | undefined = data.maintenance_order_id;
      
      if (fieldSession) {
        // Acesso de campo - usar técnico como referência
        const session = JSON.parse(fieldSession);
        console.log('🔧 Acesso de campo detectado:', session);
        fieldTechnicianId = session.technician_id;
        
        // Buscar o user_id do owner do técnico usando função segura
        const { data: ownerUserId, error: techError } = await supabase
          .rpc('get_field_technician_owner', { technician_id: session.technician_id });
          
        if (techError || !ownerUserId) {
          console.error('❌ Erro ao buscar dados do técnico:', techError);
          throw new Error('Técnico não encontrado');
        }
        
        userId = ownerUserId;
        console.log('👤 User ID do owner do técnico:', userId);

        // Criar manutenção de forma segura via RPC (bypass RLS)
        const { data: rpcResult, error: rpcError } = await supabase.rpc('create_field_maintenance', {
          technician_id: session.technician_id,
          equipment_id: data.equipment_id,
          maintenance_type: data.maintenance_type,
          periodicity: data.periodicity || null,
          observations: data.observations,
          digital_signature: data.digital_signature,
          technician_signature: data.technician_signature,
          checklist_items: data.checklist_items,
          start_datetime: data.start_datetime || new Date().toISOString(),
          end_datetime: data.end_datetime || new Date().toISOString(),
        });

        if (rpcError) {
          console.error('❌ Erro na função create_field_maintenance:', rpcError);
          throw rpcError;
        }

        maintenanceOrderId = Array.isArray(rpcResult) ? (rpcResult as any)?.[0]?.maintenance_order_id : (rpcResult as any)?.maintenance_order_id;
        if (!maintenanceOrderId) {
          throw new Error('Falha ao criar manutenção (maintenance_order_id ausente)');
        }
        createdViaRPC = true;
      } else {
        // Acesso normal - usar auth
        const { data: { user } } = await supabase.auth.getUser();
        console.log('👤 Usuário autenticado:', user?.id);
        
        if (!user) {
          console.error('❌ Usuário não autenticado');
          throw new Error('Usuário não autenticado');
        }
        userId = user.id;
      }

      // Criar o registro de execução de manutenção
      const maintenanceDescription = `${
        data.maintenance_type === 'preventive' ? 'Manutenção Preventiva' : 
        data.maintenance_type === 'corrective' ? 'Manutenção Corretiva' : 
        'Manutenção Preditiva'
      }${data.periodicity ? ` - ${data.periodicity}` : ''}

📅 Executada em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h
👤 Técnico: ${data.technician_signature}
✍️ Assinado digitalmente

🔧 Itens realizados:
${(data.checklist_items || [])
  .map((item: any) => {
    if (typeof item === 'string') return `• ${item}`;
    if (item && typeof item === 'object') {
      const statusLabel = item.status === 'conforme' ? 'Conforme' : item.status === 'nao_conforme' ? 'Não conforme' : '';
      return `• ${item.item}${statusLabel ? ` - ${statusLabel}` : ''}`;
    }
    return '';
  })
  .filter(Boolean)
  .join('\n')}
 
📝 Observações: ${data.observations}
 
🗂️ Anexos: ${data.attachments?.length || 0} arquivo(s)`;

      // maintenanceOrderId definido anteriormente

      if (!createdViaRPC) {
        if (data.maintenance_order_id) {
          console.log('📝 Atualizando O.S. existente:', data.maintenance_order_id);
          // Se há uma O.S., atualizar ela
          const { data: updatedOrder, error: updateError } = await supabase
            .from('maintenance_orders')
            .update({
              description: maintenanceDescription,
              status: 'completed',
            })
            .eq('id', data.maintenance_order_id)
            .eq('user_id', userId)
            .select()
            .single();
  
          if (updateError) {
            console.error('❌ Erro ao atualizar O.S.:', updateError);
            throw updateError;
          }
          console.log('✅ O.S. atualizada com sucesso:', updatedOrder);
        } else {
          console.log('➕ Criando nova manutenção');
          // Se não há O.S., criar um novo registro de manutenção
          const { data: newMaintenance, error: createError } = await supabase
            .from('maintenance_orders')
            .insert({
              equipment_id: data.equipment_id,
              description: maintenanceDescription,
              maintenance_type: data.maintenance_type,
              status: 'completed',
              user_id: userId,
              priority: 'medium',
              scheduled_date: new Date().toISOString().split('T')[0],
            })
            .select()
            .single();
  
          if (createError) {
            console.error('❌ Erro ao criar manutenção:', createError);
            throw createError;
          }
          console.log('✅ Nova manutenção criada com sucesso:', newMaintenance);
          maintenanceOrderId = newMaintenance.id;
        }
      }

      // Salvar anexos no storage e criar registros na tabela maintenance_attachments
      if (data.attachments && data.attachments.length > 0) {
        for (const attachment of data.attachments) {
          try {
            const fileName = `${maintenanceOrderId}/${Date.now()}_${attachment.file.name}`;
            
            // Upload do arquivo para o storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('maintenance-attachments')
              .upload(fileName, attachment.file);

            if (uploadError) {
              console.error('Erro ao fazer upload do anexo:', uploadError);
              continue;
            }

            // Criar registro na tabela maintenance_attachments
            if (fieldTechnicianId) {
              const { error: attachmentFnError } = await supabase.rpc('add_maintenance_attachment', {
                technician_id: fieldTechnicianId,
                maintenance_order_id: maintenanceOrderId,
                file_name: attachment.file.name,
                file_path: uploadData.path,
                file_type: attachment.type,
                comment: attachment.comment
              });
              if (attachmentFnError) {
                console.error('Erro ao salvar referência do anexo via RPC:', attachmentFnError);
              }
            } else {
              const { error: attachmentError } = await supabase
                .from('maintenance_attachments')
                .insert({
                  maintenance_order_id: maintenanceOrderId,
                  file_name: attachment.file.name,
                  file_path: uploadData.path,
                  file_type: attachment.type,
                  comment: attachment.comment,
                  user_id: userId
                });
              if (attachmentError) {
                console.error('Erro ao salvar referência do anexo:', attachmentError);
              }
            }
          } catch (error) {
            console.error('Erro ao processar anexo:', error);
          }
        }
      }

      if (!createdViaRPC) {
      // Processar checklist para incluir URLs das fotos dos itens
      const processedChecklistItems = await Promise.all(
        (data.checklist_items || []).map(async (item: any) => {
          if (typeof item === 'string') return item;
          
          if (item && typeof item === 'object') {
            const processedItem = { ...item };
            
            // Se há attachments (fotos) neste item do checklist
            if (item.attachments && Array.isArray(item.attachments) && item.attachments.length > 0) {
              const itemAttachmentUrls = [];
              
              for (const attachment of item.attachments) {
                try {
                  // Upload da foto do item do checklist
                  const fileName = `${maintenanceOrderId}/checklist_${Date.now()}_${attachment.file.name}`;
                  const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('maintenance-attachments')
                    .upload(fileName, attachment.file);

                  if (uploadError) {
                    console.error('Erro ao fazer upload da foto do checklist:', uploadError);
                    continue;
                  }

                  // Obter URL pública
                  const { data: urlData } = supabase.storage
                    .from('maintenance-attachments')
                    .getPublicUrl(uploadData.path);

                  if (urlData?.publicUrl) {
                    itemAttachmentUrls.push({
                      url: urlData.publicUrl,
                      file_name: attachment.file.name,
                      comment: attachment.comment || ''
                    });
                  }
                } catch (error) {
                  console.error('Erro ao processar foto do checklist:', error);
                }
              }
              
              processedItem.attachments = itemAttachmentUrls;
            }
            
            return processedItem;
          }
          
          return item;
        })
      );

      // Criar registro na tabela maintenance_executions
      const executionData = {
        user_id: userId,
        equipment_id: data.equipment_id,
        maintenance_order_id: maintenanceOrderId,
        maintenance_type: data.maintenance_type,
        periodicity: data.periodicity,
        observations: data.observations,
        digital_signature: data.digital_signature,
        technician_signature: data.technician_signature,
        checklist_items: processedChecklistItems,
        attachments: (data.attachments || []).map(att => ({
          file_name: att.file.name,
          file_type: att.type,
          comment: att.comment,
          url: att.file instanceof File ? URL.createObjectURL(att.file) : att.file
        })),
        start_datetime: data.start_datetime || new Date().toISOString(),
        end_datetime: data.end_datetime || new Date().toISOString(),
      };
  
        console.log('💾 Salvando execution data:', executionData);
  
        const { data: executionResult, error: executionError } = await supabase
          .from('maintenance_executions')
          .insert(executionData)
          .select()
          .single();
  
        if (executionError) {
          console.error('❌ Erro ao criar execution:', executionError);
          throw executionError;
        }
  
        console.log('✅ Execution criada com sucesso:', executionResult);
      }

      if (!createdViaRPC && data.maintenance_type === 'preventive') {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        // Atualizar status no cronograma preventivo anual
        const { error: scheduleUpdateError } = await supabase
          .from('annual_preventive_schedule')
          .update({
            status: 'completed',
            completed_date: currentDate.toISOString().split('T')[0],
            maintenance_order_id: maintenanceOrderId,
            updated_at: new Date().toISOString()
          })
          .eq('equipment_id', data.equipment_id)
          .eq('year', currentYear)
          .eq('month', currentMonth)
          .eq('user_id', userId);

        if (scheduleUpdateError) {
          console.warn('Erro ao atualizar cronograma preventivo:', scheduleUpdateError);
        }
      }

      return { 
        type: data.maintenance_order_id ? 'order_updated' : 'maintenance_created',
        maintenanceOrderId 
      };
    },
    onSuccess: async (result) => {
      console.log('✅ Manutenção finalizada com sucesso:', result);
      
      // Invalidar TODAS as queries relacionadas para garantir que os dados sejam atualizados
      queryClient.invalidateQueries({ queryKey: ['secure-maintenance-orders'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-orders'] });
      queryClient.invalidateQueries({ queryKey: ['preventive_schedule'] });
      queryClient.invalidateQueries({ queryKey: ['preventive_schedule_by_client'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipments'] });
      queryClient.invalidateQueries({ queryKey: ['secure-equipments'] });
      queryClient.invalidateQueries({ queryKey: ['secure-maintenance-orders-by-client'] });
      queryClient.invalidateQueries({ queryKey: ['field-equipments'] });
      queryClient.invalidateQueries({ queryKey: ['field-maintenance-orders'] });
      queryClient.invalidateQueries({ queryKey: ['field-maintenance-history'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-executions'] });
      
      // Chamar função para atualizar status dos equipamentos
      try {
        await supabase.rpc('update_equipment_maintenance_status');
        console.log('✅ Status dos equipamentos atualizado');
      } catch (error) {
        console.error('Erro ao atualizar status dos equipamentos:', error);
      }
      
      // Aguardar um pouco antes de fazer refetch para garantir que a invalidação foi processada
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['secure-maintenance-orders'] });
        queryClient.refetchQueries({ queryKey: ['secure-maintenance-orders-by-client'] });
        queryClient.refetchQueries({ queryKey: ['field-equipments'] });
        queryClient.refetchQueries({ queryKey: ['field-maintenance-orders'] });
        queryClient.refetchQueries({ queryKey: ['field-maintenance-history'] });
        queryClient.refetchQueries({ queryKey: ['maintenance-executions'] });
        queryClient.refetchQueries({ queryKey: ['equipments'] });
        queryClient.refetchQueries({ queryKey: ['secure-equipments'] });
      }, 1000);
      
      if (result.type === 'order_updated') {
        console.log('✅ O.S. finalizada e salva no histórico de manutenções');
        toast.success('✅ Manutenção registrada com sucesso!');
      } else {
        console.log('✅ Nova manutenção criada e salva no histórico de manutenções');
        toast.success('✅ Manutenção registrada com sucesso!');
      }
      
      // Log final de confirmação
      console.log('📊 Dados salvos com ID:', result.maintenanceOrderId);
      
      // Verificar se é acesso de campo e navegar automaticamente após o toast
      const fieldSession = localStorage.getItem('field_session');
      if (fieldSession) {
        setTimeout(() => {
          // Voltar para a página anterior; se não houver histórico, ir para a tela principal do técnico
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/field-access', { replace: true });
          }
        }, 1500);
      }
    },
    onError: (error) => {
      console.error('💥 Erro ao finalizar manutenção:', error);
      toast.error('❌ Erro ao finalizar a manutenção. Tente novamente.');
    },
  });
};
