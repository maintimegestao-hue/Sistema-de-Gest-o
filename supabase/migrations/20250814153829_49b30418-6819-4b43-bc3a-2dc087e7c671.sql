-- Remove políticas públicas inseguras da tabela field_technicians
DROP POLICY IF EXISTS "Allow field technician authentication" ON public.field_technicians;
DROP POLICY IF EXISTS "Field technicians can authenticate" ON public.field_technicians;

-- Manter apenas a política para usuários autenticados gerenciarem seus próprios técnicos
-- Esta política já existe: "Authenticated users can manage field technicians"

-- Verificar se a função de autenticação ainda funciona (ela usa SECURITY DEFINER)
-- Criar uma política específica para a função de autenticação se necessário
CREATE POLICY "Allow system authentication functions only" 
ON public.field_technicians 
FOR SELECT 
USING (false); -- Esta política não permite acesso direto

-- A função authenticate_field_technician ainda funcionará porque é SECURITY DEFINER