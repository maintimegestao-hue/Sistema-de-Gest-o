-- Functions to allow field technicians (anon) to create maintenance orders and executions securely
-- and to add attachments metadata, bypassing RLS with proper ownership checks.

-- 1) Create function to create maintenance order + execution in one transaction
create or replace function public.create_field_maintenance(
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
) returns table(maintenance_order_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_user_id uuid;
  new_order_id uuid;
  maintenance_description text;
begin
  -- Resolve the owner (user_id) for this technician
  select public.get_field_technician_owner(technician_id) into owner_user_id;
  if owner_user_id is null then
    raise exception 'Technician not found or has no owner';
  end if;

  -- Build a concise description similar to the app
  maintenance_description := concat(
    case 
      when maintenance_type = 'preventive' then 'Manutenção Preventiva'
      when maintenance_type = 'corrective' then 'Manutenção Corretiva'
      else 'Manutenção Preditiva'
    end,
    coalesce(' - ' || periodicity, ''),
    E'\n\n📅 Executada em: ', to_char(start_datetime at time zone 'America/Sao_Paulo','DD/MM/YYYY'), ' às ', to_char(start_datetime at time zone 'America/Sao_Paulo','HH24:MI'), 'h',
    E'\n👤 Técnico: ', technician_signature,
    E'\n✍️ Assinado digitalmente',
    E'\n\n📝 Observações: ', observations
  );

  -- Create maintenance order as completed
  insert into public.maintenance_orders(
    equipment_id, description, maintenance_type, status, user_id, priority, scheduled_date
  ) values (
    equipment_id, maintenance_description, maintenance_type, 'completed', owner_user_id, 'medium', current_date
  ) returning id into new_order_id;

  -- Create execution record
  insert into public.maintenance_executions(
    user_id, equipment_id, maintenance_order_id, maintenance_type, periodicity, observations, digital_signature, technician_signature, checklist_items, attachments, start_datetime, end_datetime
  ) values (
    owner_user_id, equipment_id, new_order_id, maintenance_type, periodicity, observations, digital_signature, technician_signature, checklist_items, '[]'::jsonb, start_datetime, end_datetime
  );

  -- If preventive, update the annual schedule
  if maintenance_type = 'preventive' then
    update public.annual_preventive_schedule
    set status = 'completed',
        completed_date = current_date,
        maintenance_order_id = new_order_id,
        updated_at = now()
    where equipment_id = equipment_id
      and year = extract(year from now())::int
      and month = extract(month from now())::int
      and user_id = owner_user_id;
  end if;

  return query select new_order_id;
end;
$$;

-- Ensure only allowed roles can execute
grant execute on function public.create_field_maintenance(
  uuid, uuid, text, text, text, text, text, text[], timestamptz, timestamptz
) to anon;

-- 2) Function to add attachment metadata after storage upload
create or replace function public.add_maintenance_attachment(
  technician_id uuid,
  maintenance_order_id uuid,
  file_name text,
  file_path text,
  file_type text,
  comment text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_user_id uuid;
begin
  select public.get_field_technician_owner(technician_id) into owner_user_id;
  if owner_user_id is null then
    raise exception 'Technician not found or has no owner';
  end if;

  insert into public.maintenance_attachments(
    maintenance_order_id, file_name, file_path, file_type, comment, user_id
  ) values (
    maintenance_order_id, file_name, file_path, file_type, comment, owner_user_id
  );
end;
$$;

grant execute on function public.add_maintenance_attachment(
  uuid, uuid, text, text, text, text
) to anon;