-- Corrigir política de INSERT para materiais para incluir verificação de usuário
DROP POLICY IF EXISTS "Users can create their own materials" ON public.materials;

CREATE POLICY "Users can create their own materials" 
ON public.materials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);