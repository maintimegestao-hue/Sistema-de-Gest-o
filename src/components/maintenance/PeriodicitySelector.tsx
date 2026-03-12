
import React from 'react';

interface PeriodicitySelectorProps {
  value: string;
  onChange: (value: string) => void;
  onReset?: () => void;
  disabled?: boolean;
}

const PeriodicitySelector = ({ value, onChange, onReset, disabled = false }: PeriodicitySelectorProps) => {
  const handleChange = (newValue: string) => {
    onChange(newValue);
    if (onReset) onReset();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-evolutec-black mb-2">
        Periodicidade
      </label>
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-evolutec-green focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
        required
      >
        <option value="">Selecione a periodicidade</option>
        <option value="monthly">Mensal</option>
        <option value="semestral">Semestral</option>
        <option value="annual">Anual</option>
      </select>
    </div>
  );
};

export default PeriodicitySelector;
