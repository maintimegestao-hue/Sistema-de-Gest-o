-- Adicionar foreign keys para service_calls
ALTER TABLE public.service_calls
ADD CONSTRAINT service_calls_equipment_id_fkey 
FOREIGN KEY (equipment_id) REFERENCES public.equipments(id) ON DELETE CASCADE;

ALTER TABLE public.service_calls
ADD CONSTRAINT service_calls_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;