-- Refine create_field_maintenance to avoid ambiguous identifiers and improve reliability
create or replace function public.create_field_maintenance(
  p_technician_id uuid,
  p_equipment_id uuid,
  p_maintenance_type text,
  p_periodicity text,
  p_observations text,
  p_digital_signature text,
  p_technician_signature text,
  p_checklist_items text[],
  p_start_datetime timestamptz,
  p_end_datetime timestamptz
) returns table(maintenance_order_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_user_id uuid;
  v_new_order_id uuid;
  v_description text;
begin
  -- Resolve the owner (user_id) for this technician
  select public.get_field_technician_owner(p_technician_id) into v_owner_user_id;
  if v_owner_user_id is null then
    raise exception 'Technician not found or has no owner';
  end if;

  -- Build description (short and safe)
  v_description := concat(
    case 
      when p_maintenance_type = 'preventive' then 'Manutenção Preventiva'
      when p_maintenance_type = 'corrective' then 'Manutenção Corretiva'
      else 'Manutenção Preditiva'
    end,
    coalesce(' - ' || p_periodicity, ''),
    E'\n\n📅 Executada em: ', to_char(p_start_datetime at time zone 'America/Sao_Paulo','DD/MM/YYYY'), ' às ', to_char(p_start_datetime at time zone 'America/Sao_Paulo','HH24:MI'), 'h',
    E'\n👤 Técnico: ', p_technician_signature,
    E'\n✍️ Assinado digitalmente',
    E'\n\n📝 Observações: ', p_observations
  );

  -- Create maintenance order as completed
  insert into public.maintenance_orders(
    equipment_id, description, maintenance_type, status, user_id, priority, scheduled_date
  ) values (
    p_equipment_id, v_description, p_maintenance_type, 'completed', v_owner_user_id, 'medium', current_date
  ) returning id into v_new_order_id;

  -- Create execution record
  insert into public.maintenance_executions(
    user_id, equipment_id, maintenance_order_id, maintenance_type, periodicity, observations, digital_signature, technician_signature, checklist_items, attachments, start_datetime, end_datetime
  ) values (
    v_owner_user_id, p_equipment_id, v_new_order_id, p_maintenance_type, p_periodicity, p_observations, p_digital_signature, p_technician_signature, p_checklist_items, '[]'::jsonb, p_start_datetime, p_end_datetime
  );

  -- If preventive, update the annual schedule for current month
  if p_maintenance_type = 'preventive' then
    update public.annual_preventive_schedule aps
    set status = 'completed',
        completed_date = current_date,
        maintenance_order_id = v_new_order_id,
        updated_at = now()
    where aps.equipment_id = p_equipment_id
      and aps.year = extract(year from now())::int
      and aps.month = extract(month from now())::int
      and aps.user_id = v_owner_user_id;
  end if;

  return query select v_new_order_id;
exception
  when others then
    raise exception 'create_field_maintenance failed: %', sqlerrm;
end;
$$;

grant execute on function public.create_field_maintenance(
  uuid, uuid, text, text, text, text, text, text[], timestamptz, timestamptz
) to anon, authenticated;
