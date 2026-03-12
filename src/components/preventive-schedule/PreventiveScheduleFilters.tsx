
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PreventiveScheduleFiltersProps {
  filters: {
    client: string;
    location: string;
    periodicity: string;
    status: string;
  };
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
}

const PreventiveScheduleFilters: React.FC<PreventiveScheduleFiltersProps> = ({
  filters,
  onApplyFilters,
  onClearFilters
}) => {
  const [localFilters, setLocalFilters] = React.useState(filters);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onApplyFilters(newFilters);
  };

  const handleClear = () => {
    const emptyFilters = {
      client: '',
      location: '',
      periodicity: 'all',
      status: 'all'
    };
    setLocalFilters(emptyFilters);
    onClearFilters();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label htmlFor="client-filter">Cliente</Label>
        <Input
          id="client-filter"
          placeholder="Filtrar por cliente"
          value={localFilters.client}
          onChange={(e) => handleFilterChange('client', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location-filter">Local</Label>
        <Input
          id="location-filter"
          placeholder="Filtrar por local"
          value={localFilters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="periodicity-filter">Periodicidade</Label>
        <Select value={localFilters.periodicity} onValueChange={(value) => handleFilterChange('periodicity', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="bimonthly">Bimestral</SelectItem>
            <SelectItem value="quarterly">Trimestral</SelectItem>
            <SelectItem value="semestral">Semestral</SelectItem>
            <SelectItem value="annual">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status-filter">Status</Label>
        <Select value={localFilters.status} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="scheduled">Agendada</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
            <SelectItem value="overdue">Atrasada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-2 lg:col-span-4 flex justify-end">
        <Button variant="outline" onClick={handleClear}>
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
};

export default PreventiveScheduleFilters;
