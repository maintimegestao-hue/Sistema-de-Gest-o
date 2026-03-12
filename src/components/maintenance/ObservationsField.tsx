
import React from 'react';

interface ObservationsFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const ObservationsField = ({ value, onChange }: ObservationsFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Permitir digitação normal, incluindo espaços
    onChange(e.target.value);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-evolutec-black mb-2">
        Observações Adicionais *
        <span className="text-xs text-gray-500 ml-1">(mínimo 3 caracteres)</span>
      </label>
      <textarea
        name="observacoes"
        placeholder="Digite observações importantes sobre a manutenção executada..."
        rows={4}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-evolutec-green focus:border-transparent resize-none"
        value={value}
        onChange={handleChange}
        required
        minLength={3}
      />
      <div className="text-xs text-gray-500 mt-1">
        Caracteres digitados: {value.trim().length}
      </div>
    </div>
  );
};

export default ObservationsField;
