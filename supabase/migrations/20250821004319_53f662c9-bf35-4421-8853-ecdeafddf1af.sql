-- Fix Field Technician Sessions Security Vulnerability
-- Remove the overly permissive policy that allows anyone to manipulate field sessions

-- Drop the dangerous policy that allows all operations with 'true' condition
DROP POLICY "Allow system to manage field sessions for authentication" ON public.field_sessions;

-- The existing user-based policies are sufficient:
-- 1. "Users can view sessions of their field technicians" - SELECT with proper user check
-- 2. "Users can create sessions for their field technicians" - INSERT with proper user check  
-- 3. "Users can update sessions of their field technicians" - UPDATE with proper user check
-- 4. "Users can delete sessions of their field technicians" - DELETE with proper user check

-- System functions like start_field_session() and authenticate_field_technician() 
-- are already marked as SECURITY DEFINER, so they can bypass RLS when needed
-- for legitimate system operations during authentication.

-- Add a comment to document the security fix
COMMENT ON TABLE public.field_sessions IS 'Field technician session management table with secure RLS policies. System functions use SECURITY DEFINER to bypass RLS for authentication operations.';