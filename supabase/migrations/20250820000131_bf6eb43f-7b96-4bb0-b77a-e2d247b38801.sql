-- Fix ambiguous column reference in create_field_maintenance function
CREATE OR REPLACE FUNCTION public.create_field_maintenance(
  technician_id uuid, 
  equipment_id uuid, 
  maintenance_type text, 
  periodicity text, 
  observations text, 
  digital_signature text, 
  technician_signature text, 
  checklist_items jsonb, 
  start_datetime timestamp with time zone, 
  end_datetime timestamp with time zone
)
RETURNS TABLE(maintenance_order_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_order_id uuid;
  v_description text;
  v_equipment_id uuid := equipment_id; -- Explicit variable assignment
BEGIN
  -- Resolve owner user for the field technician
  SELECT public.get_field_technician_owner(technician_id) INTO v_user_id;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Owner user not found for technician %', technician_id;
  END IF;

  -- Build a concise description
  v_description := (
    CASE maintenance_type
      WHEN 'preventive' THEN 'Manutenção Preventiva'
      WHEN 'corrective' THEN 'Manutenção Corretiva'
      ELSE 'Manutenção Preditiva'
    END
  ) || COALESCE(' - ' || periodicity, '') || E'\n\n'
  || '📅 Executada em: ' || to_char(COALESCE(start_datetime, now()), 'DD/MM/YYYY HH24:MI') || 'h' || E'\n'
  || '👤 Técnico: ' || COALESCE(technician_signature, '') || E'\n'
  || '✍️ Assinado digitalmente' || E'\n\n'
  || '📝 Observações: ' || COALESCE(observations, '');

  -- Create maintenance order (completed)
  INSERT INTO public.maintenance_orders (
    equipment_id, description, maintenance_type, status, user_id, priority, scheduled_date
  ) VALUES (
    v_equipment_id, v_description, maintenance_type, 'completed', v_user_id, 'medium', now()::date
  ) RETURNING id INTO v_order_id;

  -- Create execution row
  INSERT INTO public.maintenance_executions (
    user_id,
    equipment_id,
    maintenance_order_id,
    maintenance_type,
    periodicity,
    observations,
    digital_signature,
    technician_signature,
    checklist_items,
    attachments,
    start_datetime,
    end_datetime
  ) VALUES (
    v_user_id,
    v_equipment_id,
    v_order_id,
    maintenance_type,
    periodicity,
    observations,
    digital_signature,
    technician_signature,
    COALESCE(checklist_items, '[]'::jsonb),
    '[]'::jsonb,
    COALESCE(start_datetime, now()),
    COALESCE(end_datetime, now())
  );

  -- Update annual schedule if preventive
  IF maintenance_type = 'preventive' THEN
    UPDATE public.annual_preventive_schedule aps
    SET status = 'completed',
        completed_date = current_date,
        maintenance_order_id = v_order_id,
        updated_at = now()
    WHERE aps.equipment_id = v_equipment_id
      AND aps.year = EXTRACT(YEAR FROM now())::int
      AND aps.month = EXTRACT(MONTH FROM now())::int
      AND aps.user_id = v_user_id;
  END IF;

  RETURN QUERY SELECT v_order_id;
END;
$function$;