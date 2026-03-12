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