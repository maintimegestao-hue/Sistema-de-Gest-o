
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface TechnicianFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
}

const TechnicianFilters: React.FC<TechnicianFiltersProps> = ({ filters, setFilters }) => {
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
            <SelectItem value="available">Disponível</SelectItem>
            <SelectItem value="busy">Em Serviço</SelectItem>
            <SelectItem value="vacation">Férias</SelectItem>
            <SelectItem value="sick">Licença Médica</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Especialização</Label>
        <Select value={filters.specialization || ''} onValueChange={(value) => setFilters({...filters, specialization: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as especializações" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            <SelectItem value="mechanical">Mecânica</SelectItem>
            <SelectItem value="electrical">Elétrica</SelectItem>
            <SelectItem value="hydraulic">Hidráulica</SelectItem>
            <SelectItem value="automation">Automação</SelectItem>
            <SelectItem value="welding">Soldagem</SelectItem>
            <SelectItem value="instrumentation">Instrumentação</SelectItem>
            <SelectItem value="general">Geral</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Nome</Label>
        <Input 
          placeholder="Nome do técnico"
          value={filters.name || ''}
          onChange={(e) => setFilters({...filters, name: e.target.value})}
        />
      </div>
    </>
  );
};

export default TechnicianFilters;
