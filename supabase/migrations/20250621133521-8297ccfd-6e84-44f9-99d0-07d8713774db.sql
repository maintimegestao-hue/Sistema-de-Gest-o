
-- Criar tabela de fornecedores
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  cnpj TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  contact_person TEXT,
  address TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  supply_types TEXT[] DEFAULT ARRAY['materials'], -- ['materials', 'services'] ou ambos
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de fornecedores
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios fornecedores
CREATE POLICY "Users can view their own suppliers" 
  ON public.suppliers 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários criarem seus próprios fornecedores
CREATE POLICY "Users can create their own suppliers" 
  ON public.suppliers 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem seus próprios fornecedores
CREATE POLICY "Users can update their own suppliers" 
  ON public.suppliers 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para usuários deletarem seus próprios fornecedores
CREATE POLICY "Users can delete their own suppliers" 
  ON public.suppliers 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Adicionar coluna supplier_id na tabela materials para vincular materiais aos fornecedores
ALTER TABLE public.materials 
ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id);

-- Adicionar coluna supplier_id na tabela services para vincular serviços aos fornecedores
ALTER TABLE public.services 
ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id);
