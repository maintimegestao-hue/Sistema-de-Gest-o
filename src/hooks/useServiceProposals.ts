
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export interface ServiceProposal {
  id: string;
  user_id: string;
  client_id: string | null;
  equipment_id: string | null;
  proposal_number: string;
  title: string;
  description: string | null;
  scope_of_work: string;
  materials: any[];
  labor_cost: number;
  materials_cost: number;
  total_cost: number;
  estimated_duration: number | null;
  start_date: string | null;
  end_date: string | null;
  terms_and_conditions: string | null;
  validity_days: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  clients?: {
    id: string;
    name: string;
    email: string | null;
  };
  equipments?: {
    id: string;
    name: string;
    serial_number: string | null;
  };
}

const fetchServiceProposals = async (userId: string): Promise<ServiceProposal[]> => {
  const { data, error } = await supabase
    .from('service_proposals')
    .select(`
      *,
      clients:client_id (
        id,
        name,
        email
      ),
      equipments:equipment_id (
        id,
        name,
        serial_number
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as ServiceProposal[];
};

export const useServiceProposals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['service_proposals', user?.id],
    queryFn: () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return fetchServiceProposals(user.id);
    },
    enabled: !!user?.id,
  });
};
