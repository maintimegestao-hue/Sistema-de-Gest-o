
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface EquipmentFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
}

const EquipmentFilters: React.FC<EquipmentFiltersProps> = ({ filters, setFilters }) => {
  return (
    <>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={filters.status || ''} onValueChange={(value) => setFilters({...filters, status: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="operational">Operacional</SelectItem>
            <SelectItem value="maintenance">Em Manutenção</SelectItem>
            <SelectItem value="broken">Avariado</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Cliente</Label>
        <Input 
          placeholder="Nome do cliente"
          value={filters.client || ''}
          onChange={(e) => setFilters({...filters, client: e.target.value})}
        />
      </div>
      <div className="space-y-2">
        <Label>Local de Instalação</Label>
        <Input 
          placeholder="Local"
          value={filters.installation_location || ''}
          onChange={(e) => setFilters({...filters, installation_location: e.target.value})}
        />
      </div>
    </>
  );
};

export default EquipmentFilters;
