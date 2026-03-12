
import React from 'react';
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EquipmentSearchBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenFilters: () => void;
}

const EquipmentSearchBar: React.FC<EquipmentSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onOpenFilters
}) => {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <div className="relative flex-1 max-w-md">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-evolutec-text" />
        <input
          type="text"
          placeholder="Buscar equipamentos por nome, código QR, cliente, local..."
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-evolutec-green focus:border-transparent text-sm"
          maxLength={100}
        />
      </div>
      <Button variant="outline" onClick={onOpenFilters}>
        <Filter size={16} className="mr-2" />
        Filtros
      </Button>
    </div>
  );
};

export default EquipmentSearchBar;
