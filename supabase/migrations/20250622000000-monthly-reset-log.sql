
-- Criar tabela para log do reset mensal
CREATE TABLE IF NOT EXISTS monthly_reset_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(year, month)
);

-- Habilitar RLS na tabela
ALTER TABLE monthly_reset_log ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção e consulta por qualquer usuário autenticado
CREATE POLICY "Users can insert monthly reset log" 
  ON monthly_reset_log 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view monthly reset log" 
  ON monthly_reset_log 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Índice para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_monthly_reset_log_year_month 
  ON monthly_reset_log(year, month);
