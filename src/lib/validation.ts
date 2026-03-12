import { z } from 'zod';

// Equipment validation schema
export const equipmentSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  serial_number: z.string().max(50, 'Número de série muito longo').optional(),
  installation_location: z.string().max(200, 'Local de instalação muito longo').optional(),
  client: z.string().max(100, 'Nome do cliente muito longo').optional(),
  status: z.enum(['operational', 'maintenance', 'broken', 'inactive']),
});

// Technician validation schema
export const technicianSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  phone: z.string().max(20, 'Telefone muito longo').optional(),
  email: z.string().email('Email inválido').max(100, 'Email muito longo').optional(),
  specialization: z.enum(['mechanical', 'electrical', 'hydraulic', 'automation', 'welding', 'instrumentation', 'general']).optional(),
  status: z.enum(['available', 'busy', 'vacation', 'sick', 'inactive']),
});

// Maintenance order validation schema
export const maintenanceOrderSchema = z.object({
  equipment_id: z.string().uuid('ID do equipamento inválido').optional(),
  technician_id: z.string().uuid('ID do técnico inválido').optional(),
  description: z.string().min(1, 'Descrição é obrigatória').max(2000, 'Descrição muito longa'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  maintenance_type: z.enum(['preventive', 'corrective', 'predictive']),
  scheduled_date: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
});

// Report validation schema
export const reportSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  description: z.string().max(2000, 'Descrição muito longa').optional(),
  equipment_id: z.string().uuid('ID do equipamento inválido').optional(),
  technician_id: z.string().uuid('ID do técnico inválido').optional(),
  report_date: z.string(),
  attachment_url: z.string().url('URL inválida').optional(),
});

// Input sanitization functions
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Search term sanitization for filter operations - allowing spaces
export const sanitizeSearchTerm = (searchTerm: string): string => {
  return searchTerm
    .replace(/[<>]/g, '') // Remove potentially dangerous characters but keep spaces
    .substring(0, 100); // Limit length
};
