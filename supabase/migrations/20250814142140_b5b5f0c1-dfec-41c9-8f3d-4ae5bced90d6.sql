-- Corrigir vulnerabilidade de segurança na tabela field_sessions
-- Remover política permissiva atual
DROP POLICY IF EXISTS "Allow field session creation and management" ON public.field_sessions;

-- Criar políticas RLS específicas e seguras

-- 1. Permitir que usuários vejam apenas sessões de seus próprios técnicos de campo
CREATE POLICY "Users can view sessions of their field technicians"
ON public.field_sessions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.field_technicians ft 
    WHERE ft.id = field_sessions.technician_id 
    AND ft.user_id = auth.uid()
  )
);

-- 2. Permitir que usuários criem sessões apenas para seus próprios técnicos
CREATE POLICY "Users can create sessions for their field technicians"
ON public.field_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.field_technicians ft 
    WHERE ft.id = field_sessions.technician_id 
    AND ft.user_id = auth.uid()
  )
);

-- 3. Permitir que usuários atualizem apenas sessões de seus técnicos
CREATE POLICY "Users can update sessions of their field technicians"
ON public.field_sessions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.field_technicians ft 
    WHERE ft.id = field_sessions.technician_id 
    AND ft.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.field_technicians ft 
    WHERE ft.id = field_sessions.technician_id 
    AND ft.user_id = auth.uid()
  )
);

-- 4. Permitir que usuários deletem apenas sessões de seus técnicos
CREATE POLICY "Users can delete sessions of their field technicians"
ON public.field_sessions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.field_technicians ft 
    WHERE ft.id = field_sessions.technician_id 
    AND ft.user_id = auth.uid()
  )
);

-- 5. Política especial para permitir que a função start_field_session funcione
-- Esta política permite que o sistema crie/gerencie sessões durante autenticação
CREATE POLICY "Allow system to manage field sessions for authentication"
ON public.field_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);