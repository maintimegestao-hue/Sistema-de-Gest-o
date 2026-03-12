-- Função para buscar manutenções realizadas para técnicos de campo
CREATE OR REPLACE FUNCTION public.get_maintenance_history_for_field()
RETURNS TABLE(
  id uuid, 
  equipment_id uuid,
  equipment_name text,
  client_name text,
  description text,
  maintenance_type text,
  status text,
  scheduled_date date,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mo.id,
    mo.equipment_id,
    e.name as equipment_name,
    e.client as client_name,
    mo.description,
    mo.maintenance_type,
    mo.status,
    mo.scheduled_date,
    mo.created_at,
    mo.updated_at
  FROM maintenance_orders mo
  JOIN equipments e ON mo.equipment_id = e.id
  WHERE mo.status = 'completed'
  ORDER BY mo.updated_at DESC, mo.created_at DESC
  LIMIT 100;
END;
$$;