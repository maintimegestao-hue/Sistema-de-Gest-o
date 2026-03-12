-- Criar funções RPC para acesso dos técnicos de campo sem autenticação

-- Função para buscar todos os clientes para técnicos de campo
CREATE OR REPLACE FUNCTION get_all_clients_for_field()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  cnpj text,
  contact_person text,
  notes text,
  status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.user_id,
    c.name,
    c.email,
    c.phone,
    c.address,
    c.city,
    c.state,
    c.zip_code,
    c.cnpj,
    c.contact_person,
    c.notes,
    c.status,
    c.created_at,
    c.updated_at
  FROM clients c
  WHERE c.status = 'active'
  ORDER BY c.name ASC;
END;
$$;

-- Função para buscar todos os equipamentos para técnicos de campo
CREATE OR REPLACE FUNCTION get_all_equipments_for_field()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  client_id uuid,
  name text,
  serial_number text,
  installation_location text,
  client text,
  status text,
  qr_code text,
  model text,
  brand text,
  capacity text,
  preventive_periodicity text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.user_id,
    e.client_id,
    e.name,
    e.serial_number,
    e.installation_location,
    e.client,
    e.status,
    e.qr_code,
    e.model,
    e.brand,
    e.capacity,
    e.preventive_periodicity,
    e.created_at,
    e.updated_at
  FROM equipments e
  WHERE e.status IN ('operational', 'maintenance')
  ORDER BY e.name ASC;
END;
$$;