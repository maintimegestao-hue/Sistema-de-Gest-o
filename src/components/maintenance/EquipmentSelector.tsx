
import React from 'react';
import { useSecureEquipments } from '@/hooks/useSecureEquipments';

interface EquipmentSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const EquipmentSelector = ({ value, onChange, disabled = false }: EquipmentSelectorProps) => {
  const { data: equipments } = useSecureEquipments();

  return (
    <div>
      <label className="block text-sm font-medium text-evolutec-black mb-2">
        Equipamento
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-evolutec-green focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
        required
      >
        <option value="">Selecione um equipamento</option>
        {equipments?.map((equipment) => (
          <option key={equipment.id} value={equipment.id}>
            {equipment.name} - {equipment.installation_location || 'Local não informado'}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EquipmentSelector;
