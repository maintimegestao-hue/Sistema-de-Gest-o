
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ReportFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({ filters, setFilters }) => {
  return (
    <>
      <div className="space-y-2">
        <Label>Período</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input 
            type="date"
            placeholder="Data inicial"
            value={filters.dateFrom || ''}
            onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
          />
          <Input 
            type="date"
            placeholder="Data final"
            value={filters.dateTo || ''}
            onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
          />
        </div>
      </div>
    </>
  );
};

export default ReportFilters;
