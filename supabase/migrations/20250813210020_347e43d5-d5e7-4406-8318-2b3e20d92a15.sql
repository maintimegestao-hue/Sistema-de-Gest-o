-- Adicionar colunas ausentes na tabela service_proposals
ALTER TABLE public.service_proposals 
ADD COLUMN IF NOT EXISTS executor_name TEXT,
ADD COLUMN IF NOT EXISTS executor_title TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS company_phone TEXT,
ADD COLUMN IF NOT EXISTS company_email TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS services JSONB,
ADD COLUMN IF NOT EXISTS photos JSONB;