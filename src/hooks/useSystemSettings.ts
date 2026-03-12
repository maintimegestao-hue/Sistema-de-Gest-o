
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const systemSettingsSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  language: z.string().optional(),
  darkMode: z.boolean().optional(),
  notifications: z.boolean().optional(),
  autoBackup: z.boolean().optional(),
  maintenanceReminders: z.boolean().optional(),
  companyName: z.string().optional(),
  systemTitle: z.string().optional(),
  timeZone: z.string().optional(),
  dateFormat: z.string().optional(),
  currency: z.string().optional(),
});

export const useSystemSettings = () => {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('settings')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Return default settings if no profile exists or settings is empty
      if (!data || !data.settings || Object.keys(data.settings).length === 0) {
        return {
          primaryColor: "#28a745",
          secondaryColor: "#f5f5f5",
          fontFamily: "Inter",
          fontSize: "medium",
          language: "pt-BR",
          darkMode: false,
          notifications: true,
          autoBackup: true,
          maintenanceReminders: true,
          companyName: "Evolutec Systems",
          systemTitle: "Sistema de Manutenção",
          timeZone: "America/Sao_Paulo",
          dateFormat: "DD/MM/YYYY",
          currency: "BRL"
        };
      }
      
      return data.settings;
    },
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: z.infer<typeof systemSettingsSchema>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User must be logged in');

      const validatedData = systemSettingsSchema.parse(settings);
      
      // First, try to update existing profile
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update({ 
            settings: validatedData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            settings: validatedData,
            role: 'admin'
          });

        if (error) throw error;
      }

      return validatedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success('Configurações salvas com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast.error('Erro ao salvar configurações. Tente novamente.');
    },
  });
};
