-- Criar tabela para chamados dos clientes
CREATE TABLE public.service_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL,
  equipment_id UUID NOT NULL,
  call_number TEXT NOT NULL UNIQUE,
  problem_types TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  photos JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  opened_by_client BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  technician_id UUID,
  maintenance_order_id UUID,
  client_notes TEXT,
  internal_notes TEXT
);

-- Habilitar RLS
ALTER TABLE public.service_calls ENABLE ROW LEVEL SECURITY;

-- Políticas para admins (podem ver todos os chamados)
CREATE POLICY "Admins can view all service calls" 
ON public.service_calls 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update service calls" 
ON public.service_calls 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Políticas para criação de chamados (sistema interno)
CREATE POLICY "System can create service calls" 
ON public.service_calls 
FOR INSERT 
WITH CHECK (true);

-- Função para gerar número do chamado
CREATE OR REPLACE FUNCTION public.generate_call_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  call_number TEXT;
BEGIN
  -- Buscar o próximo número disponível
  SELECT COALESCE(MAX(CAST(SUBSTRING(call_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM service_calls
  WHERE call_number ~ '^CH-[0-9]+$';
  
  -- Gerar o número do chamado
  call_number := 'CH-' || LPAD(next_number::TEXT, 6, '0');
  
  RETURN call_number;
END;
$$;

-- Função para criar chamado (será chamada pelo edge function)
CREATE OR REPLACE FUNCTION public.create_service_call(
  p_client_id UUID,
  p_equipment_id UUID,
  p_problem_types TEXT[],
  p_description TEXT DEFAULT NULL,
  p_photos JSONB DEFAULT '[]'::JSONB,
  p_client_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  call_id UUID,
  call_number TEXT,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_call_id UUID;
  v_call_number TEXT;
  v_equipment_user_id UUID;
BEGIN
  -- Buscar o user_id do equipamento para associar ao chamado
  SELECT user_id INTO v_equipment_user_id
  FROM equipments
  WHERE id = p_equipment_id;
  
  IF v_equipment_user_id IS NULL THEN
    RAISE EXCEPTION 'Equipment not found';
  END IF;
  
  -- Gerar número do chamado
  v_call_number := generate_call_number();
  
  -- Inserir o chamado
  INSERT INTO service_calls (
    user_id,
    client_id,
    equipment_id,
    call_number,
    problem_types,
    description,
    photos,
    client_notes,
    status,
    priority
  ) VALUES (
    v_equipment_user_id,
    p_client_id,
    p_equipment_id,
    v_call_number,
    p_problem_types,
    p_description,
    p_photos,
    p_client_notes,
    'open',
    CASE 
      WHEN 'emergency' = ANY(p_problem_types) THEN 'high'
      WHEN 'malfunction' = ANY(p_problem_types) THEN 'high'
      ELSE 'medium'
    END
  ) RETURNING id INTO v_call_id;
  
  -- Retornar informações do chamado criado
  RETURN QUERY
  SELECT v_call_id, v_call_number, 'open'::TEXT;
END;
$$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_service_calls_updated_at
BEFORE UPDATE ON public.service_calls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();