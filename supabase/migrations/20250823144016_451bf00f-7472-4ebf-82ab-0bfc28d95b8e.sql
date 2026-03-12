-- Fix the ambiguous column reference in create_service_call function
CREATE OR REPLACE FUNCTION public.create_service_call(p_client_id uuid, p_equipment_id uuid, p_problem_types text[], p_description text DEFAULT NULL::text, p_photos jsonb DEFAULT '[]'::jsonb, p_client_notes text DEFAULT NULL::text)
 RETURNS TABLE(call_id uuid, call_number text, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
  
  -- Retornar informações do chamado criado usando variáveis locais
  RETURN QUERY
  SELECT v_call_id, v_call_number, 'open'::TEXT;
END;
$function$