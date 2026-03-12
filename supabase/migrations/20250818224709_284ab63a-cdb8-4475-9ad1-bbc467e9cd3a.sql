-- Add signature fields to service_proposals for proposal PDF
ALTER TABLE public.service_proposals
ADD COLUMN IF NOT EXISTS technician_signature TEXT NULL,
ADD COLUMN IF NOT EXISTS client_signature TEXT NULL;