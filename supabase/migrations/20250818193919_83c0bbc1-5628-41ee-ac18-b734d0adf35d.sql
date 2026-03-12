-- Optimize service_proposals lookups by user, client and created_at ordering
CREATE INDEX IF NOT EXISTS idx_service_proposals_user_client_created_at
ON public.service_proposals (user_id, client_id, created_at DESC);