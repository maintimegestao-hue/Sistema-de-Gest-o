-- Fix critical security vulnerability in client_sessions table
-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Allow system to manage client sessions" ON public.client_sessions;

-- Create secure policies that only allow system functions to manage sessions
-- No direct access to client sessions from the frontend
CREATE POLICY "System functions can manage client sessions"
ON public.client_sessions 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Allow the authenticate_client and start_client_session functions to work
-- by creating a security definer function for session validation
CREATE OR REPLACE FUNCTION public.validate_client_session(session_access_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.client_sessions cs
    JOIN public.client_access ca ON cs.client_access_id = ca.id
    WHERE cs.access_code = session_access_code 
    AND cs.is_active = true
    AND ca.is_active = true
  );
END;
$$;