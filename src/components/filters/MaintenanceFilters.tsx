
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MaintenanceFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
}

const MaintenanceFilters: React.FC<MaintenanceFiltersProps> = ({ filters, setFilters }) => {
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
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Tipo de Manutenção</Label>
        <Select value={filters.type || ''} onValueChange={(value) => setFilters({...filters, type: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="preventive">Preventiva</SelectItem>
            <SelectItem value="corrective">Corretiva</SelectItem>
            <SelectItem value="predictive">Preditiva</SelectItem>
            <SelectItem value="emergency">Emergencial</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Prioridade</Label>
        <Select value={filters.priority || ''} onValueChange={(value) => setFilters({...filters, priority: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as prioridades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="critical">Crítica</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default MaintenanceFilters;
