-- Adicionar status de manutenção aos equipamentos
ALTER TABLE equipments ADD COLUMN IF NOT EXISTS maintenance_status TEXT DEFAULT 'awaiting';

-- Adicionar função para atualizar status de cronograma preventivo automaticamente
CREATE OR REPLACE FUNCTION update_equipment_maintenance_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  equipment_record RECORD;
  current_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
  current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
  has_execution BOOLEAN;
BEGIN
  -- Iterar sobre todos os equipamentos ativos
  FOR equipment_record IN
    SELECT id, user_id
    FROM equipments
    WHERE status IN ('operational', 'active')
  LOOP
    -- Verificar se existe execução de manutenção preventiva no mês atual
    SELECT EXISTS (
      SELECT 1 
      FROM maintenance_executions me
      WHERE me.equipment_id = equipment_record.id
      AND me.maintenance_type = 'preventive'
      AND EXTRACT(MONTH FROM me.created_at) = current_month
      AND EXTRACT(YEAR FROM me.created_at) = current_year
    ) INTO has_execution;
    
    -- Atualizar status baseado na execução
    IF has_execution THEN
      UPDATE equipments 
      SET maintenance_status = 'completed'
      WHERE id = equipment_record.id;
      
      -- Atualizar status no cronograma preventivo
      UPDATE annual_preventive_schedule
      SET status = 'completed',
          completed_date = CURRENT_DATE
      WHERE equipment_id = equipment_record.id
      AND year = current_year
      AND month = current_month;
    ELSE
      -- Verificar se é início do mês para resetar status
      IF EXTRACT(DAY FROM CURRENT_DATE) = 1 THEN
        UPDATE equipments 
        SET maintenance_status = 'awaiting'
        WHERE id = equipment_record.id;
        
        -- Marcar mês anterior como overdue se não foi completado
        UPDATE annual_preventive_schedule
        SET status = 'overdue'
        WHERE equipment_id = equipment_record.id
        AND year = current_year
        AND month = CASE WHEN current_month = 1 THEN 12 ELSE current_month - 1 END
        AND status != 'completed';
        
        -- Marcar mês atual como pending
        UPDATE annual_preventive_schedule
        SET status = 'pending'
        WHERE equipment_id = equipment_record.id
        AND year = current_year
        AND month = current_month
        AND status = 'scheduled';
      ELSE
        -- Verificar se está pendente (dentro do mês)
        UPDATE equipments 
        SET maintenance_status = 'pending'
        WHERE id = equipment_record.id
        AND maintenance_status != 'completed';
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Criar função para resetar cronograma anual
CREATE OR REPLACE FUNCTION reset_annual_preventive_schedule()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
  -- Reset todos os equipamentos para awaiting no início do ano
  IF EXTRACT(MONTH FROM CURRENT_DATE) = 1 AND EXTRACT(DAY FROM CURRENT_DATE) = 1 THEN
    UPDATE equipments 
    SET maintenance_status = 'awaiting'
    WHERE status IN ('operational', 'active');
    
    -- Reset cronograma anual
    UPDATE annual_preventive_schedule
    SET status = 'scheduled',
        completed_date = NULL
    WHERE year = current_year;
  END IF;
END;
$$;