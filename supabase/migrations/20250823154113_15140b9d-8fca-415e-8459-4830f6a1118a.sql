-- Fix ambiguous column reference in generate_call_number and prevent similar issue in generate_order_number
-- Both functions are recreated safely

-- Fix generate_call_number
CREATE OR REPLACE FUNCTION public.generate_call_number()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  next_number INTEGER;
  v_call_number TEXT;
BEGIN
  -- Compute next numeric suffix from existing service call numbers
  SELECT COALESCE(MAX(CAST(SUBSTRING(sc.call_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.service_calls sc
  WHERE sc.call_number ~ '^CH-[0-9]+$';
  
  -- Build the call number with prefix
  v_call_number := 'CH-' || LPAD(next_number::TEXT, 6, '0');
  
  RETURN v_call_number;
END;
$function$;

-- Also fix potential ambiguity in generate_order_number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  next_number INTEGER;
  v_order_number TEXT;
BEGIN
  -- Compute next numeric suffix from existing maintenance order numbers
  SELECT COALESCE(MAX(CAST(SUBSTRING(mo.order_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.maintenance_orders mo
  WHERE mo.order_number ~ '^OS-[0-9]+$';
  
  -- Build the order number with prefix
  v_order_number := 'OS-' || LPAD(next_number::TEXT, 6, '0');
  
  RETURN v_order_number;
END;
$function$;