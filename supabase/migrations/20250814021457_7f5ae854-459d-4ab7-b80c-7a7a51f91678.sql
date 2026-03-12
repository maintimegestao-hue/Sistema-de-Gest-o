-- Criar tabela para funcionários técnicos com acesso ao sistema
CREATE TABLE public.field_technicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- Admin que criou
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  access_code TEXT NOT NULL UNIQUE, -- Código de acesso único
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.field_technicians ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can manage field technicians" 
ON public.field_technicians 
FOR ALL 
USING (auth.uid() = user_id);

-- Técnicos podem ver apenas seus próprios dados
CREATE POLICY "Field technicians can view own data" 
ON public.field_technicians 
FOR SELECT 
USING (access_code = current_setting('app.current_access_code', true));

-- Criar tabela para sessões de técnicos de campo
CREATE TABLE public.field_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  technician_id UUID NOT NULL REFERENCES public.field_technicians(id) ON DELETE CASCADE,
  access_code TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.field_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para sessões
CREATE POLICY "Technicians can manage own sessions" 
ON public.field_sessions 
FOR ALL 
USING (access_code = current_setting('app.current_access_code', true));

-- Função para autenticar técnico de campo
CREATE OR REPLACE FUNCTION public.authenticate_field_technician(
  input_access_code TEXT
) RETURNS TABLE(
  technician_id UUID,
  name TEXT,
  email TEXT,
  is_active BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ft.id,
    ft.name,
    ft.email,
    ft.is_active
  FROM public.field_technicians ft
  WHERE ft.access_code = input_access_code
    AND ft.is_active = true;
END;
$$;

-- Função para iniciar sessão de técnico
CREATE OR REPLACE FUNCTION public.start_field_session(
  input_access_code TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  technician_record RECORD;
  session_id UUID;
BEGIN
  -- Verificar se o código é válido
  SELECT * INTO technician_record
  FROM public.field_technicians
  WHERE access_code = input_access_code
    AND is_active = true;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid access code or inactive technician';
  END IF;
  
  -- Desativar sessões anteriores
  UPDATE public.field_sessions
  SET is_active = false
  WHERE technician_id = technician_record.id
    AND is_active = true;
  
  -- Criar nova sessão
  INSERT INTO public.field_sessions (technician_id, access_code)
  VALUES (technician_record.id, input_access_code)
  RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_field_technicians()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_field_technicians_updated_at
  BEFORE UPDATE ON public.field_technicians
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_field_technicians();