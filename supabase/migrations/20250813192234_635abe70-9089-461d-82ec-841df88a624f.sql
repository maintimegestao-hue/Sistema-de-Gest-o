-- Corrigir equipamentos que estão com client_id errado
-- Mover equipamentos "Neo rodas" e "NEO RODAS" para o cliente correto

-- Primeiro, vamos verificar e corrigir equipamentos que deveriam estar no cliente "Neo Rodas" (sem Tatui)
UPDATE equipments 
SET client_id = 'ca5a97f4-0787-4c24-8a39-f45fddbe61f0'
WHERE (client = 'Neo rodas' OR client = 'NEO RODAS') 
AND client_id != 'ca5a97f4-0787-4c24-8a39-f45fddbe61f0';

-- Garantir que equipamentos "Neo Rodas Tatui" permaneçam no cliente correto
UPDATE equipments 
SET client_id = '79dc2887-86ab-4fd2-8bcd-70a3255a0d57'
WHERE client = 'Neo Rodas Tatui' 
AND client_id != '79dc2887-86ab-4fd2-8bcd-70a3255a0d57';