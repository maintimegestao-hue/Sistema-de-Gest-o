
import React from 'react';

interface MaintenanceTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onReset?: () => void;
  disabled?: boolean;
}

const MaintenanceTypeSelector = ({ value, onChange, onReset, disabled = false }: MaintenanceTypeSelectorProps) => {
  const handleChange = (newValue: string) => {
    onChange(newValue);
    if (onReset) onReset();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-evolutec-black mb-2">
        Tipo de Manutenção
      </label>
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-evolutec-green focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
        required
      >
        <option value="">Selecione o tipo</option>
        <option value="preventive">Preventiva</option>
        <option value="predictive">Preditiva</option>
        <option value="corrective">Corretiva</option>
      </select>
    </div>
  );
};

export default MaintenanceTypeSelector;
