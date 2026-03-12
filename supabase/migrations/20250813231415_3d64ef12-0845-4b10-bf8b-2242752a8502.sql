-- Adicionar coluna company_logo na tabela service_proposals
ALTER TABLE public.service_proposals 
ADD COLUMN company_logo TEXT;