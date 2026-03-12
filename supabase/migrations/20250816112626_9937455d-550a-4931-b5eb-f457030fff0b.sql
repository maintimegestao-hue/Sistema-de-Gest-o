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