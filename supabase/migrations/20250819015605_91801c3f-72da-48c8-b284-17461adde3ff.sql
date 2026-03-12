-- Add foreign key constraints to pipeline_items table
ALTER TABLE public.pipeline_items 
ADD CONSTRAINT fk_pipeline_items_client_id 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

ALTER TABLE public.pipeline_items 
ADD CONSTRAINT fk_pipeline_items_service_proposal_id 
FOREIGN KEY (service_proposal_id) REFERENCES public.service_proposals(id) ON DELETE SET NULL;

ALTER TABLE public.pipeline_items 
ADD CONSTRAINT fk_pipeline_items_stage_id 
FOREIGN KEY (stage_id) REFERENCES public.pipeline_stages(id) ON DELETE CASCADE;