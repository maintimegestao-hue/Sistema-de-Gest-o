-- Criar bucket para anexos de manutenção
INSERT INTO storage.buckets (id, name, public) VALUES ('maintenance-attachments', 'maintenance-attachments', true);

-- Criar tabela para armazenar referências dos anexos
CREATE TABLE public.maintenance_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  maintenance_order_id UUID NOT NULL REFERENCES public.maintenance_orders(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE public.maintenance_attachments ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela maintenance_attachments
CREATE POLICY "Users can view their own maintenance attachments"
ON public.maintenance_attachments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own maintenance attachments"
ON public.maintenance_attachments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maintenance attachments"
ON public.maintenance_attachments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own maintenance attachments"
ON public.maintenance_attachments
FOR DELETE
USING (auth.uid() = user_id);

-- Políticas para o bucket maintenance-attachments
CREATE POLICY "Authenticated users can view maintenance attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'maintenance-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload maintenance attachments"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'maintenance-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their maintenance attachments"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'maintenance-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their maintenance attachments"
ON storage.objects
FOR DELETE
USING (bucket_id = 'maintenance-attachments' AND auth.role() = 'authenticated');