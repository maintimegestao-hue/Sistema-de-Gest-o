-- Atualizar tabela user_profiles para incluir campos da empresa
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
ADD COLUMN IF NOT EXISTS brand_primary_color TEXT DEFAULT '#22C55E',
ADD COLUMN IF NOT EXISTS brand_secondary_color TEXT DEFAULT '#16A34A',
ADD COLUMN IF NOT EXISTS brand_accent_color TEXT DEFAULT '#15803D';

-- Comentários para documentar os campos
COMMENT ON COLUMN public.user_profiles.phone IS 'Telefone do usuário';
COMMENT ON COLUMN public.user_profiles.position IS 'Cargo/Posição do usuário na empresa';
COMMENT ON COLUMN public.user_profiles.department IS 'Departamento do usuário';
COMMENT ON COLUMN public.user_profiles.cnpj IS 'CNPJ da empresa';
COMMENT ON COLUMN public.user_profiles.company_address IS 'Endereço da empresa';
COMMENT ON COLUMN public.user_profiles.profile_photo_url IS 'URL da foto de perfil do usuário';
COMMENT ON COLUMN public.user_profiles.company_logo_url IS 'URL do logotipo da empresa';
COMMENT ON COLUMN public.user_profiles.brand_primary_color IS 'Cor primária da marca extraída do logo';
COMMENT ON COLUMN public.user_profiles.brand_secondary_color IS 'Cor secundária da marca extraída do logo';
COMMENT ON COLUMN public.user_profiles.brand_accent_color IS 'Cor de destaque da marca extraída do logo';