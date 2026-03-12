
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const equipmentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  model: z.string().optional(),
  brand: z.string().optional(),
  capacity: z.string().optional(),
  serial_number: z.string().optional(),
  status: z.enum(["operational", "maintenance", "inactive", "broken"]).optional(),
  client: z.string().optional(),
  installation_location: z.string().optional(),
});

export const useSecureEquipments = (clientId?: string | null) => {
  return useQuery({
    queryKey: ['secure-equipments', clientId],
    queryFn: async () => {
      console.log('🔍 Fetching equipments for client:', clientId);
      
      // Para páginas do cliente, usar a edge function que não requer autenticação de usuário
      if (clientId) {
        const clientAccessCode = localStorage.getItem('client_access_code') || localStorage.getItem('clientAccessCode');
        console.log('🔑 Using client access for equipments');
        
        const { data, error } = await supabase.functions.invoke('get-client-equipments', {
          body: {
            clientId,
            accessCode: clientAccessCode
          }
        });
        
        if (error) {
          console.log('❌ Error fetching client equipments:', error);
          throw error;
        }
        
        console.log('✅ Client equipments fetched successfully:', data?.equipments?.length || 0);
        return data?.equipments || [];
      }
      
      // Para usuários autenticados normais
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ User not authenticated');
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('equipments')
        .select(`
          *,
          clients(name)
        `)
        .eq('user_id', user.id);

      // Se um cliente específico foi selecionado, filtrar por ele
      if (clientId) {
        // Buscar primeiro o nome do cliente para também filtrar equipamentos antigos
        const { data: clientData } = await supabase
          .from('clients')
          .select('name')
          .eq('id', clientId)
          .single();

        if (clientData) {
          // Filtrar por client_id OU pelo nome EXATO do cliente (para equipamentos antigos)
          // Usar correspondência exata para evitar sobreposição entre clientes similares
          query = query.or(`client_id.eq.${clientId},client.eq.${clientData.name}`);
        } else {
          // Se não encontrou o cliente, filtrar apenas por client_id
          query = query.eq('client_id', clientId);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.log('❌ Error fetching equipments:', error);
        throw error;
      }
      
      console.log('✅ Equipments fetched successfully:', data?.length || 0);
      return data || [];
    },
    // Sempre habilitar a query - quando não há clientId, busca todos os equipamentos do usuário
    enabled: true,
  });
};

export const useCreateSecureEquipment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (equipmentData: z.infer<typeof equipmentSchema>) => {
      console.log('🚀 Creating equipment with data:', equipmentData);
      
      try {
        // Verificar autenticação primeiro
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.log('❌ Authentication error:', authError);
          throw new Error('Erro de autenticação. Faça login novamente.');
        }
        
        if (!user) {
          console.log('❌ User not authenticated for equipment creation');
          throw new Error('Usuário não autenticado. Faça login para continuar.');
        }

        console.log('👤 User authenticated:', user.id);

        // Validar dados
        const validatedData = equipmentSchema.parse(equipmentData);
        console.log('✅ Data validated:', validatedData);
        
        // Gerar QR Code único
        const qrCode = `EQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log('🏷️ Generated QR Code:', qrCode);
        
        // Preparar dados para inserção
        const insertData = {
          name: validatedData.name,
          model: validatedData.model || null,
          brand: validatedData.brand || null,
          capacity: validatedData.capacity || null,
          serial_number: validatedData.serial_number || null,
          status: validatedData.status || 'operational',
          client: validatedData.client || null,
          installation_location: validatedData.installation_location || null,
          user_id: user.id,
          qr_code: qrCode,
        };

        console.log('📝 Insert data prepared:', insertData);

        // Inserir no banco de dados
        const { data, error } = await supabase
          .from('equipments')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.log('❌ Database error:', error);
          
          // Tratar erros específicos
          if (error.code === '23505') {
            throw new Error('Este equipamento já existe. Verifique o nome ou número de série.');
          } else if (error.code === '42501') {
            throw new Error('Permissão negada. Verifique suas credenciais.');
          } else if (error.message.includes('user_profiles')) {
            throw new Error('Erro de configuração do perfil. Entre em contato com o suporte.');
          } else {
            throw new Error(`Erro ao salvar no banco de dados: ${error.message}`);
          }
        }

        console.log('✅ Equipment created successfully:', data);
        return data;
        
      } catch (validationError) {
        console.log('❌ Validation/Creation error:', validationError);
        
        if (validationError instanceof z.ZodError) {
          const firstError = validationError.errors[0];
          throw new Error(`Erro de validação: ${firstError.message}`);
        }
        
        // Re-throw outros erros
        throw validationError;
      }
    },
    onSuccess: (data) => {
      console.log('🎉 Equipment creation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['secure-equipments'] });
      toast.success('Equipamento criado com sucesso!');
    },
    onError: (error) => {
      console.error('💥 Error creating equipment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao criar equipamento';
      toast.error(errorMessage);
    },
  });
};

export const useUpdateSecureEquipment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...equipmentData }: { id: string } & Partial<z.infer<typeof equipmentSchema>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const validatedData = equipmentSchema.partial().parse(equipmentData);
      
      const updateData: Record<string, any> = {};
      if (validatedData.name !== undefined) updateData.name = validatedData.name;
      if (validatedData.model !== undefined) updateData.model = validatedData.model;
      if (validatedData.brand !== undefined) updateData.brand = validatedData.brand;
      if (validatedData.capacity !== undefined) updateData.capacity = validatedData.capacity;
      if (validatedData.serial_number !== undefined) updateData.serial_number = validatedData.serial_number;
      if (validatedData.status !== undefined) updateData.status = validatedData.status;
      if (validatedData.client !== undefined) updateData.client = validatedData.client;
      if (validatedData.installation_location !== undefined) updateData.installation_location = validatedData.installation_location;
      
      const { data, error } = await supabase
        .from('equipments')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-equipments'] });
      toast.success('Equipamento atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating equipment:', error);
      toast.error('Erro ao atualizar equipamento. Tente novamente.');
    },
  });
};

export const useDeleteSecureEquipment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Attempting to delete equipment:', id);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.log('❌ Authentication error:', authError);
        throw new Error('Erro de autenticação. Faça login novamente.');
      }
      
      if (!user) {
        console.log('❌ User not authenticated for equipment deletion');
        throw new Error('Usuário não autenticado. Faça login para continuar.');
      }

      console.log('👤 User authenticated for deletion:', user.id);

      // Primeiro, verificar se existem dependências
      console.log('🔍 Checking for maintenance orders...');
      const { data: maintenanceOrders, error: moError } = await supabase
        .from('maintenance_orders')
        .select('id')
        .eq('equipment_id', id)
        .eq('user_id', user.id);

      if (moError) {
        console.log('❌ Error checking maintenance orders:', moError);
        throw new Error('Erro ao verificar ordens de manutenção vinculadas.');
      }

      console.log('🔍 Checking for reports...');
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('id')
        .eq('equipment_id', id)
        .eq('user_id', user.id);

      if (reportsError) {
        console.log('❌ Error checking reports:', reportsError);
        throw new Error('Erro ao verificar relatórios vinculados.');
      }

      // Se existem dependências, informar ao usuário
      const dependencies = [];
      if (maintenanceOrders && maintenanceOrders.length > 0) {
        dependencies.push(`${maintenanceOrders.length} ordem(ns) de manutenção`);
      }
      if (reports && reports.length > 0) {
        dependencies.push(`${reports.length} relatório(s)`);
      }

      if (dependencies.length > 0) {
        const dependencyText = dependencies.join(' e ');
        throw new Error(`Não é possível excluir este equipamento pois possui ${dependencyText} vinculado(s). Exclua primeiro esses registros ou entre em contato com o suporte.`);
      }

      console.log('✅ No dependencies found, proceeding with deletion');

      // Proceder com a exclusão
      const { error: deleteError } = await supabase
        .from('equipments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        console.log('❌ Database error during deletion:', deleteError);
        
        // Tratar erros específicos
        if (deleteError.code === '23503') {
          throw new Error('Este equipamento possui registros vinculados e não pode ser excluído. Entre em contato com o suporte.');
        } else if (deleteError.code === '42501') {
          throw new Error('Permissão negada para excluir este equipamento.');
        } else {
          throw new Error(`Erro ao excluir equipamento: ${deleteError.message}`);
        }
      }

      console.log('✅ Equipment deleted successfully');
    },
    onSuccess: () => {
      console.log('🎉 Equipment deletion successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['secure-equipments'] });
      toast.success('Equipamento excluído com sucesso!');
    },
    onError: (error) => {
      console.error('💥 Error deleting equipment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao excluir equipamento';
      toast.error(errorMessage);
    },
  });
};
