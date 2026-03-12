-- Verificar se existe um perfil de usuário e configurar como admin
-- Este script define o primeiro usuário registrado como administrador da plataforma

DO $$ 
DECLARE 
    first_user_id uuid;
BEGIN
    -- Pegar o primeiro usuário registrado (provavelmente você, o dono da plataforma)
    SELECT id INTO first_user_id 
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Inserir ou atualizar perfil como admin
        INSERT INTO public.user_profiles (user_id, role, full_name, company_name)
        VALUES (
            first_user_id, 
            'admin', 
            'Administrador da Plataforma',
            'Evolutec AI Manage'
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            role = 'admin',
            full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
            company_name = COALESCE(EXCLUDED.company_name, user_profiles.company_name),
            updated_at = now();
            
        RAISE NOTICE 'Usuário % configurado como administrador da plataforma', first_user_id;
    END IF;
END $$;

-- Garantir que usuários admin sempre tenham permissões totais
COMMENT ON TABLE user_profiles IS 'Tabela de perfis de usuário. Role admin = acesso total sem limitações de plano';