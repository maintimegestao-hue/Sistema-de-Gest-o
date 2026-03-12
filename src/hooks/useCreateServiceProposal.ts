
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";

interface CreateServiceProposalData {
  title: string;
  client_id?: string;
  equipment_id?: string;
  description?: string;
  scope_of_work: string;
  executor_name?: string;
  executor_title?: string;
  labor_cost: number;
  materials_cost: number;
  payment_method?: string;
  discount_percentage?: number;
  estimated_duration?: number;
  validity_days: number;
  terms_and_conditions?: string;
  notes?: string;
  company_logo?: File | null;
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  photos?: File[];
  technician_signature?: string | null;
  client_signature?: string | null;
  selected_materials?: Array<{
    material_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  selected_services?: Array<{
    service_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export const useCreateServiceProposal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateServiceProposalData) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar dados do cliente se especificado
      let clientData = null;
      if (data.client_id) {
        const { data: client } = await supabase
          .from('clients')
          .select('name, address, phone, email, contact_person, cnpj')
          .eq('id', data.client_id)
          .single();
        
        clientData = client;
      }

      // Gerar número da proposta
      const proposalNumber = `PROP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Calcular custos
      const subtotal = data.labor_cost + data.materials_cost;
      const discountAmount = (subtotal * (data.discount_percentage || 0)) / 100;
      const totalCost = subtotal - discountAmount;

      // Converter fotos para base64 para armazenar no banco (ignora falhas individuais)
      let photosData: string[] = [];
      if (data.photos && data.photos.length > 0) {
        const results = await Promise.allSettled(
          data.photos.map(async (photo: File) => {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(photo);
            });
          })
        );
        photosData = results
          .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
          .map((r) => r.value);
      }

      // Converter logo para base64 se existir (com fallback seguro)
      let companyLogoData: string | null = null;
      if (data.company_logo) {
        try {
          companyLogoData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(data.company_logo!);
          });
        } catch (e) {
          console.warn('Falha ao converter logo, continuando sem logo.', e);
          companyLogoData = null;
        }
      }

      // Preparar dados para inserção incluindo TODOS os campos
      const proposalData = {
        user_id: user.id,
        proposal_number: proposalNumber,
        title: data.title,
        client_id: data.client_id || null,
        equipment_id: data.equipment_id || null,
        description: data.description || null,
        scope_of_work: data.scope_of_work,
        labor_cost: data.labor_cost,
        materials_cost: data.materials_cost,
        total_cost: totalCost,
        estimated_duration: data.estimated_duration || null,
        validity_days: data.validity_days,
        terms_and_conditions: data.terms_and_conditions || null,
        notes: data.notes || null,
        status: 'draft',
        // Incluir dados do executor
        executor_name: data.executor_name || null,
        executor_title: data.executor_title || null,
        // Incluir dados da empresa
        company_name: data.company_name || null,
        company_address: data.company_address || null,
        company_phone: data.company_phone || null,
        company_email: data.company_email || null,
        company_logo: companyLogoData,
        // Incluir método de pagamento
        payment_method: data.payment_method || null,
        discount_percentage: data.discount_percentage || 0,
        // Incluir materiais e serviços selecionados
        materials: data.selected_materials || [],
        services: data.selected_services || [],
        // Incluir fotos convertidas para base64
        photos: photosData,
        // Assinaturas
        technician_signature: data.technician_signature || null,
        client_signature: data.client_signature || null
      };

      console.log('Criando proposta com dados completos:', proposalData);
      console.log('Dados do executor:', {
        executor_name: data.executor_name,
        executor_title: data.executor_title
      });
      console.log('Dados da empresa:', {
        company_name: data.company_name,
        company_address: data.company_address,
        company_phone: data.company_phone,
        company_email: data.company_email
      });
      console.log('Dados de pagamento:', {
        payment_method: data.payment_method,
        discount_percentage: data.discount_percentage
      });

      const { data: proposal, error } = await supabase
        .from('service_proposals')
        .insert([proposalData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar proposta:', error);
        throw new Error(error.message);
      }

      console.log('Proposta criada com sucesso:', proposal);
      return proposal;
    },
    onSuccess: (_proposal, variables) => {
      // Invalidar caches relevantes para atualizar as listas
      queryClient.invalidateQueries({ queryKey: ['service_proposals'] });
      if (variables?.client_id) {
        queryClient.invalidateQueries({ queryKey: ['service-proposals-by-client', variables.client_id] });
      }
      // Toast será exibido no componente chamador para evitar duplicidade
    },
    onError: (error) => {
      console.error('Erro ao criar proposta:', error);
      toast.error('Erro ao criar proposta. Tente novamente.');
    },
  });
};
