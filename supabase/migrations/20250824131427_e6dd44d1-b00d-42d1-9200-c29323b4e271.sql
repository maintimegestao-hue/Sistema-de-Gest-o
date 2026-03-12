-- Atualizar função get_maintenance_history_for_field para incluir dados de execução
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
  updated_at timestamp with time zone,
  execution_id uuid,
  observations text,
  checklist_items jsonb,
  attachments jsonb,
  technician_signature text,
  digital_signature text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
    mo.updated_at,
    me.id as execution_id,
    me.observations,
    me.checklist_items,
    me.attachments,
    me.technician_signature,
    me.digital_signature
  FROM maintenance_orders mo
  JOIN equipments e ON mo.equipment_id = e.id
  LEFT JOIN maintenance_executions me ON mo.id = me.maintenance_order_id
  WHERE mo.status = 'completed'
  ORDER BY mo.updated_at DESC, mo.created_at DESC
  LIMIT 100;
END;
$function$;