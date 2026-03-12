
export interface ProposalData {
  id: string;
  title: string;
  proposal_number: string;
  description?: string;
  scope_of_work: string;
  total_cost: number;
  labor_cost: number;
  materials_cost: number;
  estimated_duration?: number;
  validity_days: number;
  start_date?: string;
  end_date?: string;
  terms_and_conditions?: string;
  notes?: string;
  created_at: string;
  clients?: { 
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    phone?: string;
    email?: string;
    contact_person?: string;
    cnpj?: string;
  };
  equipments?: {
    name: string;
    model?: string;
    brand?: string;
    serial_number?: string;
    installation_location?: string;
  };
  materials?: any[];
  services?: any[];
  company_logo?: string | File;
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  executor_name?: string;
  executor_title?: string;
  payment_method?: string;
  discount_percentage?: number;
  photos?: File[] | string[];
  technician_signature?: string;
  client_signature?: string;
}
