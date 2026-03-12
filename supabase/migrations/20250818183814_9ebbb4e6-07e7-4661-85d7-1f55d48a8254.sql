-- Criar tabela subscribers se não existir ou atualizar estrutura
-- Esta tabela controlará o trial de 7 dias para novos usuários

-- Adicionar novos campos necessários para o trial
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS trial_expired BOOLEAN DEFAULT false;
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS days_remaining INTEGER DEFAULT 7;

-- Função para calcular dias restantes automaticamente
CREATE OR REPLACE FUNCTION calculate_trial_days(trial_end_date timestamptz)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT GREATEST(0, EXTRACT(days FROM (trial_end_date - now()))::INTEGER);
$$;

-- Atualizar trigger para gerenciar trial automaticamente
CREATE OR REPLACE FUNCTION public.initialize_trial_period()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.subscribers (
    user_id,
    email,
    subscribed,
    subscription_tier,
    trial_start,
    trial_end,
    trial_expired,
    days_remaining
  ) VALUES (
    NEW.id,
    NEW.email,
    false,
    'trial',
    now(),
    now() + INTERVAL '7 days',
    false,
    7
  )
  ON CONFLICT (email) DO UPDATE SET
    trial_start = EXCLUDED.trial_start,
    trial_end = EXCLUDED.trial_end,
    trial_expired = false,
    days_remaining = 7,
    updated_at = now()
  WHERE subscribers.user_id IS NULL; -- Só atualiza se ainda não tem user_id
  
  RETURN NEW;
END;
$function$;