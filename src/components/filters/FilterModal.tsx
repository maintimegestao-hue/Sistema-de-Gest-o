
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import EquipmentFilters from './EquipmentFilters';
import MaintenanceFilters from './MaintenanceFilters';
import TechnicianFilters from './TechnicianFilters';
import ReportFilters from './ReportFilters';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
  type: 'equipments' | 'maintenance' | 'technicians' | 'reports';
}

const FilterModal: React.FC<FilterModalProps> = ({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  onClearFilters,
  type 
}) => {
  const [filters, setFilters] = useState<any>({});

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({});
    onClearFilters();
    onClose();
  };

  const renderFilters = () => {
    switch (type) {
      case 'equipments':
        return <EquipmentFilters filters={filters} setFilters={setFilters} />;
      case 'maintenance':
        return <MaintenanceFilters filters={filters} setFilters={setFilters} />;
      case 'technicians':
        return <TechnicianFilters filters={filters} setFilters={setFilters} />;
      case 'reports':
        return <ReportFilters filters={filters} setFilters={setFilters} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-evolutec-black">
            Filtrar Resultados
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {renderFilters()}
        </div>

        <div className="flex justify-between space-x-2 pt-4">
          <Button variant="outline" onClick={handleClear}>
            Limpar Filtros
          </Button>
          <Button className="evolutec-btn" onClick={handleApply}>
            Aplicar Filtros
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;
