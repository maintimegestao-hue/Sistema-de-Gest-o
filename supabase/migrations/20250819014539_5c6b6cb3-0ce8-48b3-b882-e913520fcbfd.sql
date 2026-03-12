-- Create tables for service proposal pipeline/funnel system

-- Create pipeline stages table
CREATE TABLE public.pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  color TEXT DEFAULT '#22C55E',
  required_fields JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pipeline items table (represents each proposal/service in the pipeline)
CREATE TABLE public.pipeline_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_proposal_id UUID,
  client_id UUID NOT NULL,
  stage_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  value NUMERIC DEFAULT 0,
  attachments JSONB DEFAULT '[]'::jsonb,
  stage_data JSONB DEFAULT '{}'::jsonb, -- Store stage-specific data
  moved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pipeline_stages
CREATE POLICY "Users can view their own pipeline stages" 
ON public.pipeline_stages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pipeline stages" 
ON public.pipeline_stages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pipeline stages" 
ON public.pipeline_stages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pipeline stages" 
ON public.pipeline_stages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for pipeline_items
CREATE POLICY "Users can view their own pipeline items" 
ON public.pipeline_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pipeline items" 
ON public.pipeline_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pipeline items" 
ON public.pipeline_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pipeline items" 
ON public.pipeline_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_pipeline_stages_updated_at
BEFORE UPDATE ON public.pipeline_stages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pipeline_items_updated_at
BEFORE UPDATE ON public.pipeline_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default pipeline stages for SC proposals
INSERT INTO public.pipeline_stages (user_id, name, stage_order, color, required_fields) VALUES
('00000000-0000-0000-0000-000000000000', 'Visita Técnica', 1, '#3B82F6', '["technical_report"]'::jsonb),
('00000000-0000-0000-0000-000000000000', 'Elaboração da Proposta', 2, '#F59E0B', '["service_proposal"]'::jsonb),
('00000000-0000-0000-0000-000000000000', 'Envio ao Cliente', 3, '#8B5CF6', '["email_evidence", "message_evidence"]'::jsonb),
('00000000-0000-0000-0000-000000000000', 'Proposta Aprovada', 4, '#10B981', '["purchase_order", "approval_email", "billing_authorization"]'::jsonb),
('00000000-0000-0000-0000-000000000000', 'Relatório de Conclusão SC', 5, '#06B6D4', '["completion_report", "client_signature"]'::jsonb),
('00000000-0000-0000-0000-000000000000', 'Financeiro', 6, '#EF4444', '["all_documents_compiled"]'::jsonb),
('00000000-0000-0000-0000-000000000000', 'Serviço a Faturar', 7, '#F97316', '["invoice_sent_email"]'::jsonb),
('00000000-0000-0000-0000-000000000000', 'Serviço Faturado', 8, '#22C55E', '["payment_confirmation"]'::jsonb);

-- Create function to initialize user pipeline stages
CREATE OR REPLACE FUNCTION public.initialize_user_pipeline_stages()
RETURNS TRIGGER AS $$
BEGIN
  -- Copy default stages for new user
  INSERT INTO public.pipeline_stages (user_id, name, stage_order, color, required_fields)
  SELECT 
    NEW.id,
    name,
    stage_order,
    color,
    required_fields
  FROM public.pipeline_stages 
  WHERE user_id = '00000000-0000-0000-0000-000000000000';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize stages for new users (when they create their first profile)
CREATE TRIGGER initialize_pipeline_stages_on_profile_creation
AFTER INSERT ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.initialize_user_pipeline_stages();