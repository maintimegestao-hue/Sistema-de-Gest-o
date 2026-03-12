-- Atualizar relatórios para vincular ao cliente correto através do equipamento
UPDATE reports 
SET client_id = equipments.client_id
FROM equipments 
WHERE reports.equipment_id = equipments.id 
AND reports.client_id IS NULL 
AND equipments.client_id IS NOT NULL;