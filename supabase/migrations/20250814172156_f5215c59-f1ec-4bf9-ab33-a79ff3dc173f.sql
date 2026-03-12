-- Adicionar campos de data/hora de início e fim na execução de manutenção
CREATE TABLE IF NOT EXISTS public.maintenance_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  equipment_id UUID,
  maintenance_order_id UUID,
  technician_signature TEXT NOT NULL,
  digital_signature TEXT NOT NULL,
  observations TEXT NOT NULL,
  maintenance_type TEXT NOT NULL,
  periodicity TEXT,
  checklist_items JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_executions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own maintenance executions" 
ON public.maintenance_executions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own maintenance executions" 
ON public.maintenance_executions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maintenance executions" 
ON public.maintenance_executions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own maintenance executions" 
ON public.maintenance_executions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_maintenance_executions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
CREATE TRIGGER update_maintenance_executions_updated_at
BEFORE UPDATE ON public.maintenance_executions
FOR EACH ROW
EXECUTE FUNCTION public.update_maintenance_executions_updated_at();