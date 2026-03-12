
export interface ReportData {
  id: string;
  title: string;
  description?: string;
  report_date: string;
  created_at: string;
  equipments?: { name: string };
  technicians?: { 
    name: string;
    specialization?: string;
    phone?: string;
    email?: string;
  };
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
  // Dados da empresa
  company_logo?: string | File;
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  // Dados pessoais do responsável  
  full_name?: string;
  position?: string;
  department?: string;
  cnpj?: string;
  // Anexos
  attachment_url?: string;
  photos?: File[] | string[];
  // Assinaturas
  technician_signature?: string;
  client_signature?: string;
}
