-- Bucket (se já existir, ignora)
insert into storage.buckets (id, name, public)
values ('maintenance-attachments', 'maintenance-attachments', true)
on conflict (id) do nothing;

-- Permitir SELECT para anon e authenticated no bucket
create policy if not exists "Anon can view maintenance attachments (service-call)"
on storage.objects
for select
using (
  bucket_id = 'maintenance-attachments'
  and (auth.role() = 'anon' or auth.role() = 'authenticated')
);

-- Permitir INSERT apenas para objetos de chamados (prefixo service-call-)
create policy if not exists "Anon can upload service-call photos"
on storage.objects
for insert
with check (
  bucket_id = 'maintenance-attachments'
  and (auth.role() = 'anon' or auth.role() = 'authenticated')
  and (name like 'service-call-%')
);

-- Opcional: permitir UPDATE só nesses objetos (pode manter ou remover)
create policy if not exists "Users can update service-call photos"
on storage.objects
for update
using (
  bucket_id = 'maintenance-attachments'
  and (auth.role() = 'anon' or auth.role() = 'authenticated')
  and (name like 'service-call-%')
);
