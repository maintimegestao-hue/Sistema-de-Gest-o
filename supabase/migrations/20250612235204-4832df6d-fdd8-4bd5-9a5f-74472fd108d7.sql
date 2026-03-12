
-- Criar tabela de materiais
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  internal_code TEXT,
  category TEXT,
  unit_of_measure TEXT,
  brand TEXT,
  model TEXT,
  technical_description TEXT,
  stock_quantity NUMERIC DEFAULT 0,
  unit_price NUMERIC DEFAULT 0,
  supplier TEXT,
  physical_location TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de serviços pré-orçados
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC DEFAULT 0,
  service_type TEXT DEFAULT 'corrective', -- corrective, preventive, predictive
  estimated_time INTEGER, -- em horas
  complexity_level TEXT DEFAULT 'medium', -- low, medium, high
  recommended_team TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de relação entre serviços e materiais
CREATE TABLE public.service_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  quantity NUMERIC DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de materiais de proposta de serviço
CREATE TABLE public.proposal_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES public.service_proposals(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id),
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de serviços de proposta de serviço
CREATE TABLE public.proposal_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES public.service_proposals(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id),
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS (Row Level Security) para as tabelas
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_services ENABLE ROW LEVEL SECURITY;

-- Políticas para materials
CREATE POLICY "Users can view their own materials" 
  ON public.materials 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own materials" 
  ON public.materials 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own materials" 
  ON public.materials 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own materials" 
  ON public.materials 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para services
CREATE POLICY "Users can view their own services" 
  ON public.services 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own services" 
  ON public.services 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services" 
  ON public.services 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services" 
  ON public.services 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para service_materials
CREATE POLICY "Users can view service materials through services" 
  ON public.service_materials 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM services 
    WHERE services.id = service_materials.service_id 
    AND services.user_id = auth.uid()
  ));

CREATE POLICY "Users can create service materials through services" 
  ON public.service_materials 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM services 
    WHERE services.id = service_materials.service_id 
    AND services.user_id = auth.uid()
  ));

CREATE POLICY "Users can update service materials through services" 
  ON public.service_materials 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM services 
    WHERE services.id = service_materials.service_id 
    AND services.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete service materials through services" 
  ON public.service_materials 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM services 
    WHERE services.id = service_materials.service_id 
    AND services.user_id = auth.uid()
  ));

-- Políticas para proposal_materials
CREATE POLICY "Users can view proposal materials through proposals" 
  ON public.proposal_materials 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM service_proposals 
    WHERE service_proposals.id = proposal_materials.proposal_id 
    AND service_proposals.user_id = auth.uid()
  ));

CREATE POLICY "Users can create proposal materials through proposals" 
  ON public.proposal_materials 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM service_proposals 
    WHERE service_proposals.id = proposal_materials.proposal_id 
    AND service_proposals.user_id = auth.uid()
  ));

CREATE POLICY "Users can update proposal materials through proposals" 
  ON public.proposal_materials 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM service_proposals 
    WHERE service_proposals.id = proposal_materials.proposal_id 
    AND service_proposals.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete proposal materials through proposals" 
  ON public.proposal_materials 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM service_proposals 
    WHERE service_proposals.id = proposal_materials.proposal_id 
    AND service_proposals.user_id = auth.uid()
  ));

-- Políticas para proposal_services
CREATE POLICY "Users can view proposal services through proposals" 
  ON public.proposal_services 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM service_proposals 
    WHERE service_proposals.id = proposal_services.proposal_id 
    AND service_proposals.user_id = auth.uid()
  ));

CREATE POLICY "Users can create proposal services through proposals" 
  ON public.proposal_services 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM service_proposals 
    WHERE service_proposals.id = proposal_services.proposal_id 
    AND service_proposals.user_id = auth.uid()
  ));

CREATE POLICY "Users can update proposal services through proposals" 
  ON public.proposal_services 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM service_proposals 
    WHERE service_proposals.id = proposal_services.proposal_id 
    AND service_proposals.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete proposal services through proposals" 
  ON public.proposal_services 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM service_proposals 
    WHERE service_proposals.id = proposal_services.proposal_id 
    AND service_proposals.user_id = auth.uid()
  ));
