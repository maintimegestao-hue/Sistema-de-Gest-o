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

-- Função para autenticar cliente
CREATE OR REPLACE FUNCTION public.authenticate_client(input_access_code text)
RETURNS TABLE(client_access_id uuid, client_id uuid, client_name text, permissions jsonb, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ca.id,
    ca.client_id,
    c.name,
    ca.permissions,
    ca.is_active
  FROM public.client_access ca
  JOIN public.clients c ON ca.client_id = c.id
  WHERE ca.access_code = input_access_code
    AND ca.is_active = true;
END;
$function$

-- Função para iniciar sessão de cliente
CREATE OR REPLACE FUNCTION public.start_client_session(input_access_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  client_record RECORD;
  session_id UUID;
BEGIN
  -- Verificar se o código é válido
  SELECT * INTO client_record
  FROM public.client_access
  WHERE access_code = input_access_code
    AND is_active = true;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid access code or inactive client access';
  END IF;
  
  -- Criar tabela de sessões de cliente se não existir
  CREATE TABLE IF NOT EXISTS public.client_sessions (
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
  
  -- Criar política se não existir
  DO $$ 
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'client_sessions' 
      AND policyname = 'Allow system to manage client sessions'
    ) THEN
      CREATE POLICY "Allow system to manage client sessions"
      ON public.client_sessions
      FOR ALL
      USING (true)
      WITH CHECK (true);
    END IF;
  END $$;
  
  -- Desativar sessões anteriores
  UPDATE public.client_sessions
  SET is_active = false
  WHERE client_access_id = client_record.id
    AND is_active = true;
  
  -- Criar nova sessão
  INSERT INTO public.client_sessions (client_access_id, client_id, access_code)
  VALUES (client_record.id, client_record.client_id, input_access_code)
  RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$function$

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_client_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_access_updated_at
BEFORE UPDATE ON public.client_access
FOR EACH ROW
EXECUTE FUNCTION public.update_client_access_updated_at();