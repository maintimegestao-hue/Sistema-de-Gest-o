-- Initialize pipeline stages for existing users who don't have them yet
INSERT INTO public.pipeline_stages (user_id, name, stage_order, color, required_fields)
SELECT 
  up.user_id,
  ps.name,
  ps.stage_order,
  ps.color,
  ps.required_fields
FROM public.user_profiles up
CROSS JOIN public.pipeline_stages ps
WHERE ps.user_id = '00000000-0000-0000-0000-000000000000'
AND NOT EXISTS (
  SELECT 1 FROM public.pipeline_stages existing 
  WHERE existing.user_id = up.user_id
);