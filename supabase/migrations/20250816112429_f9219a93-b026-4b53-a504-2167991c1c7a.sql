-- Criar tabela para gerenciar acessos de clientes
CREATE TABLE public.client_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL,
  access_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  permissions JSONB NOT NULL DEFAULT '{"preventive_schedule": true, "managerial_reports": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_access ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage client access" 
ON public.client_access 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Criar tabela de sessões de cliente
CREATE TABLE public.client_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_access_id UUID NOT NULL,
  client_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  access_code TEXT NOT NULL
);

-- Enable RLS na tabela de sessões
ALTER TABLE public.client_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies para client_sessions
CREATE POLICY "Allow system to manage client sessions"
ON public.client_sessions
FOR ALL
USING (true)
WITH CHECK (true);