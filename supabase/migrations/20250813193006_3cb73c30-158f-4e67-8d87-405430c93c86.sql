-- Deletar equipamento sem cliente (EATAHT)
DELETE FROM equipments 
WHERE name = 'EATAHT' AND client_id IS NULL;