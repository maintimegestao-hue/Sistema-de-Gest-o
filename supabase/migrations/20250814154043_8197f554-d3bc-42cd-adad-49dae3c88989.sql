-- Função para buscar user_id do técnico de campo (para uso interno do sistema)
CREATE OR REPLACE FUNCTION public.get_field_technician_owner(technician_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT user_id INTO owner_id
  FROM field_technicians 
  WHERE id = technician_id 
  AND is_active = true;
  
  RETURN owner_id;
END;
$$;