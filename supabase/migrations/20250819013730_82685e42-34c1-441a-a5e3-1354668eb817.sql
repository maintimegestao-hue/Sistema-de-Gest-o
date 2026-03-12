-- Drop and recreate with the SAME parameter names expected by the client
DROP FUNCTION IF EXISTS public.create_field_maintenance(
  uuid, uuid, text, text, text, text, text, text[], timestamptz, timestamptz
);

CREATE OR REPLACE FUNCTION public.create_field_maintenance(
  technician_id uuid,
  equipment_id uuid,
  maintenance_type text,
  periodicity text,
  observations text,
  digital_signature text,
  technician_signature text,
  checklist_items text[],
  start_datetime timestamptz,
  end_datetime timestamptz
) RETURNS TABLE(maintenance_order_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_user_id uuid;
  new_order_id uuid;
  description text;
BEGIN
  -- Resolve owner user
  SELECT public.get_field_technician_owner(technician_id) INTO owner_user_id;
  IF owner_user_id IS NULL THEN
    RAISE EXCEPTION 'Technician not found or has no owner';
  END IF;

  -- Build description
  description := concat(
    CASE 
      WHEN maintenance_type = 'preventive' THEN 'Manutenção Preventiva'
      WHEN maintenance_type = 'corrective' THEN 'Manutenção Corretiva'
      ELSE 'Manutenção Preditiva'
    END,
    coalesce(' - ' || periodicity, ''),
    E'\n\n📅 Executada em: ', to_char(start_datetime at time zone 'America/Sao_Paulo','DD/MM/YYYY'), ' às ', to_char(start_datetime at time zone 'America/Sao_Paulo','HH24:MI'), 'h',
    E'\n👤 Técnico: ', technician_signature,
    E'\n✍️ Assinado digitalmente',
    E'\n\n📝 Observações: ', observations
  );

  -- Insert maintenance order
  INSERT INTO public.maintenance_orders (
    equipment_id, description, maintenance_type, status, user_id, priority, scheduled_date
  ) VALUES (
    equipment_id, description, maintenance_type, 'completed', owner_user_id, 'medium', current_date
  ) RETURNING id INTO new_order_id;

  -- Insert execution
  INSERT INTO public.maintenance_executions (
    user_id, equipment_id, maintenance_order_id, maintenance_type, periodicity, observations, digital_signature, technician_signature, checklist_items, attachments, start_datetime, end_datetime
  ) VALUES (
    owner_user_id, equipment_id, new_order_id, maintenance_type, periodicity, observations, digital_signature, technician_signature, checklist_items, '[]'::jsonb, start_datetime, end_datetime
  );

  -- Update annual schedule if preventive
  IF maintenance_type = 'preventive' THEN
    UPDATE public.annual_preventive_schedule aps
    SET status = 'completed',
        completed_date = current_date,
        maintenance_order_id = new_order_id,
        updated_at = now()
    WHERE aps.equipment_id = equipment_id
      AND aps.year = extract(year from now())::int
      AND aps.month = extract(month from now())::int
      AND aps.user_id = owner_user_id;
  END IF;

  RETURN QUERY SELECT new_order_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'create_field_maintenance failed: %', SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_field_maintenance(
  uuid, uuid, text, text, text, text, text, text[], timestamptz, timestamptz
) TO anon, authenticated;