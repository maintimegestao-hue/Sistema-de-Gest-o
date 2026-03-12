
import React from 'react';
import { Button } from '@/components/ui/button';

interface QRManualInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const QRManualInput: React.FC<QRManualInputProps> = ({ value, onChange, onSubmit }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-evolutec-black">
        Digite o código ou nome do equipamento:
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="EQ-XXXXXXX ou nome do equipamento"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-evolutec-green focus:border-transparent"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSubmit();
            }
          }}
        />
        <Button onClick={onSubmit} className="evolutec-btn">
          OK
        </Button>
      </div>
    </div>
  );
};

export default QRManualInput;
