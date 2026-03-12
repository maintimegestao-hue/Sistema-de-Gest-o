
-- Adicionar coluna de periodicidade na tabela equipments se não existir
ALTER TABLE equipments 
ADD COLUMN IF NOT EXISTS preventive_periodicity TEXT DEFAULT 'monthly' 
CHECK (preventive_periodicity IN ('monthly', 'bimonthly', 'quarterly', 'semestral', 'annual'));

-- Criar tabela para armazenar o cronograma preventivo anual
CREATE TABLE IF NOT EXISTS annual_preventive_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  equipment_id UUID NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'pending', 'completed', 'overdue')),
  maintenance_order_id UUID REFERENCES maintenance_orders(id),
  due_date DATE,
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(equipment_id, year, month)
);

-- Habilitar RLS na nova tabela
ALTER TABLE annual_preventive_schedule ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para annual_preventive_schedule
CREATE POLICY "Users can view their own annual schedule" 
  ON annual_preventive_schedule 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own annual schedule" 
  ON annual_preventive_schedule 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own annual schedule" 
  ON annual_preventive_schedule 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own annual schedule" 
  ON annual_preventive_schedule 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Função para gerar cronograma preventivo automaticamente
CREATE OR REPLACE FUNCTION generate_annual_preventive_schedule(target_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER)
RETURNS VOID AS $$
DECLARE
  equipment_record RECORD;
  month_num INTEGER;
  due_date DATE;
BEGIN
  -- Para cada equipamento do usuário atual
  FOR equipment_record IN
    SELECT id, preventive_periodicity, user_id
    FROM equipments
    WHERE user_id = auth.uid()
  LOOP
    -- Limpar cronograma existente para o ano
    DELETE FROM annual_preventive_schedule 
    WHERE equipment_id = equipment_record.id 
    AND year = target_year;
    
    -- Gerar cronograma baseado na periodicidade
    FOR month_num IN 1..12 LOOP
      -- Verificar se deve ter manutenção neste mês baseado na periodicidade
      IF (
        (equipment_record.preventive_periodicity = 'monthly') OR
        (equipment_record.preventive_periodicity = 'bimonthly' AND month_num % 2 = 1) OR
        (equipment_record.preventive_periodicity = 'quarterly' AND month_num % 3 = 1) OR
        (equipment_record.preventive_periodicity = 'semestral' AND month_num % 6 = 1) OR
        (equipment_record.preventive_periodicity = 'annual' AND month_num = 1)
      ) THEN
        -- Calcular data de vencimento (último dia do mês)
        due_date := DATE_TRUNC('month', DATE(target_year || '-' || month_num || '-01')) + INTERVAL '1 month - 1 day';
        
        -- Inserir no cronograma
        INSERT INTO annual_preventive_schedule (
          user_id,
          equipment_id,
          year,
          month,
          due_date,
          status
        ) VALUES (
          equipment_record.user_id,
          equipment_record.id,
          target_year,
          month_num,
          due_date,
          CASE 
            WHEN due_date < CURRENT_DATE THEN 'overdue'
            WHEN due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'pending'
            ELSE 'scheduled'
          END
        )
        ON CONFLICT (equipment_id, year, month) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar cronograma quando equipamento for modificado
CREATE OR REPLACE FUNCTION update_schedule_on_equipment_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Regenerar cronograma para o ano atual
  PERFORM generate_annual_preventive_schedule(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS equipment_preventive_schedule_trigger ON equipments;
CREATE TRIGGER equipment_preventive_schedule_trigger
  AFTER INSERT OR UPDATE OF preventive_periodicity ON equipments
  FOR EACH ROW
  EXECUTE FUNCTION update_schedule_on_equipment_change();
