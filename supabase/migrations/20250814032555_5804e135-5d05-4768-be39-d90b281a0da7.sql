-- Corrigir as políticas RLS para permitir login de técnicos
-- Remover política restritiva que pode estar bloqueando
DROP POLICY IF EXISTS "Admins can manage field technicians" ON field_technicians;

-- Criar políticas específicas e mais claras
CREATE POLICY "Field technicians can authenticate"
ON field_technicians
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can manage field technicians"
ON field_technicians
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);