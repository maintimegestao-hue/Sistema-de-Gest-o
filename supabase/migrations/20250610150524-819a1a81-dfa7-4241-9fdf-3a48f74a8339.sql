
-- Adicionar colunas de cliente aos equipamentos se não existirem
ALTER TABLE equipments 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Adicionar colunas de cliente às tabelas principais
ALTER TABLE maintenance_orders 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

ALTER TABLE service_proposals 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Criar tabela para perfis de usuário com roles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'client', 'technician')),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar RLS na nova tabela
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para user_profiles
CREATE POLICY "Users can view their own profile" 
  ON user_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON user_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
  ON user_profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() AND up.role = 'admin'
    )
  );

-- Atualizar políticas RLS existentes para incluir isolamento por cliente
DROP POLICY IF EXISTS "Users can view their own equipments" ON equipments;
CREATE POLICY "Users can view their own equipments" 
  ON equipments 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND (up.role = 'admin' OR up.client_id = equipments.client_id)
    )
  );

DROP POLICY IF EXISTS "Users can view their own maintenance orders" ON maintenance_orders;
CREATE POLICY "Users can view their own maintenance orders" 
  ON maintenance_orders 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND (up.role = 'admin' OR up.client_id = maintenance_orders.client_id)
    )
  );

DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
CREATE POLICY "Users can view their own reports" 
  ON reports 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND (up.role = 'admin' OR up.client_id = reports.client_id)
    )
  );

-- Função para obter estatísticas comparativas entre clientes (apenas para admins)
CREATE OR REPLACE FUNCTION get_client_comparison_stats()
RETURNS TABLE (
  client_id UUID,
  client_name TEXT,
  total_equipments BIGINT,
  monthly_orders BIGINT,
  completed_on_time_percentage NUMERIC,
  overdue_maintenances BIGINT,
  reports_generated BIGINT,
  compliance_score NUMERIC
) AS $$
BEGIN
  -- Verificar se o usuário é admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    c.id as client_id,
    c.name as client_name,
    COALESCE(eq_count.total, 0) as total_equipments,
    COALESCE(mo_count.monthly, 0) as monthly_orders,
    COALESCE(
      CASE 
        WHEN mo_stats.total_orders > 0 
        THEN (mo_stats.completed_on_time::NUMERIC / mo_stats.total_orders::NUMERIC) * 100
        ELSE 0 
      END, 0
    ) as completed_on_time_percentage,
    COALESCE(mo_overdue.overdue, 0) as overdue_maintenances,
    COALESCE(rep_count.reports, 0) as reports_generated,
    COALESCE(
      CASE 
        WHEN mo_stats.total_orders > 0 
        THEN LEAST(10, (mo_stats.completed_on_time::NUMERIC / mo_stats.total_orders::NUMERIC) * 10)
        ELSE 0 
      END, 0
    ) as compliance_score
  FROM clients c
  LEFT JOIN (
    SELECT client_id, COUNT(*) as total
    FROM equipments 
    GROUP BY client_id
  ) eq_count ON c.id = eq_count.client_id
  LEFT JOIN (
    SELECT client_id, COUNT(*) as monthly
    FROM maintenance_orders 
    WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY client_id
  ) mo_count ON c.id = mo_count.client_id
  LEFT JOIN (
    SELECT 
      client_id,
      COUNT(*) as total_orders,
      COUNT(CASE WHEN status = 'completed' AND scheduled_date >= created_at::DATE THEN 1 END) as completed_on_time
    FROM maintenance_orders
    WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY client_id
  ) mo_stats ON c.id = mo_stats.client_id
  LEFT JOIN (
    SELECT client_id, COUNT(*) as overdue
    FROM maintenance_orders 
    WHERE status IN ('pending', 'in_progress') 
    AND scheduled_date < CURRENT_DATE
    GROUP BY client_id
  ) mo_overdue ON c.id = mo_overdue.client_id
  LEFT JOIN (
    SELECT client_id, COUNT(*) as reports
    FROM reports 
    WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY client_id
  ) rep_count ON c.id = rep_count.client_id
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
