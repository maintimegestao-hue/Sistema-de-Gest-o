
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  cnpj: z.string().optional(),
  contact_person: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
});

export const useSecureClients = () => {
  return useQuery({
    queryKey: ['secure-clients'],
    queryFn: async () => {
      console.log('🔍 Fetching secure clients...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching secure clients:', error);
        throw error;
      }
      
      console.log('✅ Secure clients fetched successfully:', data?.length || 0);
      return data || [];
    },
    enabled: true,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};

export const useCreateSecureClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientData: z.infer<typeof clientSchema>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const validatedData = clientSchema.parse(clientData);
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          address: validatedData.address,
          city: validatedData.city,
          state: validatedData.state,
          zip_code: validatedData.zip_code,
          cnpj: validatedData.cnpj,
          contact_person: validatedData.contact_person,
          notes: validatedData.notes,
          status: validatedData.status,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-clients'] });
      toast.success('Cliente criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating client:', error);
      toast.error('Erro ao criar cliente. Tente novamente.');
    },
  });
};

export const useUpdateSecureClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...clientData }: { id: string } & Partial<z.infer<typeof clientSchema>>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const validatedData = clientSchema.partial().parse(clientData);
      
      const updateData: Record<string, any> = {};
      if (validatedData.name !== undefined) updateData.name = validatedData.name;
      if (validatedData.email !== undefined) updateData.email = validatedData.email;
      if (validatedData.phone !== undefined) updateData.phone = validatedData.phone;
      if (validatedData.address !== undefined) updateData.address = validatedData.address;
      if (validatedData.city !== undefined) updateData.city = validatedData.city;
      if (validatedData.state !== undefined) updateData.state = validatedData.state;
      if (validatedData.zip_code !== undefined) updateData.zip_code = validatedData.zip_code;
      if (validatedData.cnpj !== undefined) updateData.cnpj = validatedData.cnpj;
      if (validatedData.contact_person !== undefined) updateData.contact_person = validatedData.contact_person;
      if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
      if (validatedData.status !== undefined) updateData.status = validatedData.status;
      
      const { data, error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-clients'] });
      toast.success('Cliente atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating client:', error);
      toast.error('Erro ao atualizar cliente. Tente novamente.');
    },
  });
};

export const useDeleteSecureClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-clients'] });
      toast.success('Cliente excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting client:', error);
      toast.error('Erro ao excluir cliente. Tente novamente.');
    },
  });
};
