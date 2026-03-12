-- Create RPC to fetch equipments maintained today (preventive) for a field technician
CREATE OR REPLACE FUNCTION public.get_maintained_equipment_ids_today_for_field(technician_id uuid)
RETURNS TABLE(equipment_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT public.get_field_technician_owner(technician_id) INTO v_user_id;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Owner user not found for technician %', technician_id;
  END IF;

  RETURN QUERY
  SELECT me.equipment_id
  FROM public.maintenance_executions me
  WHERE me.user_id = v_user_id
    AND me.maintenance_type = 'preventive'
    AND me.created_at::date = CURRENT_DATE;
END;
$function$;