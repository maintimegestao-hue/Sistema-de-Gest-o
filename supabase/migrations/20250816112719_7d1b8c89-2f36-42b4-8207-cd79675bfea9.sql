-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_client_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_access_updated_at
BEFORE UPDATE ON public.client_access
FOR EACH ROW
EXECUTE FUNCTION public.update_client_access_updated_at();