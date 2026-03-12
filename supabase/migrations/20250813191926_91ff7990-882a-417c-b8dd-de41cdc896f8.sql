-- Atualizar equipamentos existentes para vincular ao cliente correto
-- Equipamentos do "Neo Rodas Tatui"
UPDATE equipments 
SET client_id = '79dc2887-86ab-4fd2-8bcd-70a3255a0d57'
WHERE client ILIKE '%Neo Rodas Tatui%' AND client_id IS NULL;

-- Equipamentos do "Neo Rodas" (genérico)
UPDATE equipments 
SET client_id = 'ca5a97f4-0787-4c24-8a39-f45fddbe61f0'
WHERE client ILIKE '%Neo Rodas%' AND client ILIKE '%Tatui%' = FALSE AND client_id IS NULL;

-- Equipamentos do "NEO RODAS" (maiúsculo)
UPDATE equipments 
SET client_id = 'fd0c5572-e82b-4a70-a3d2-95045f41b605'
WHERE client ILIKE '%NEO RODAS%' AND client ILIKE '%Tatui%' = FALSE AND client_id IS NULL;