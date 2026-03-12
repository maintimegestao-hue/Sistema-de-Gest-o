
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import QRManualInput from './QRManualInput';

interface QRInitialViewProps {
  onStartCamera: () => void;
  manualInput: string;
  onManualInputChange: (value: string) => void;
  onManualSubmit: () => void;
}

const QRInitialView: React.FC<QRInitialViewProps> = ({
  onStartCamera,
  manualInput,
  onManualInputChange,
  onManualSubmit
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <Camera size={48} className="mx-auto text-evolutec-green mb-4" />
        <p className="text-evolutec-text mb-4">
          Clique para ativar a câmera e escanear o QR Code do equipamento
        </p>
      </div>
      
      <Button onClick={onStartCamera} className="evolutec-btn w-full">
        <Camera size={16} className="mr-2" />
        Ativar Câmera
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-evolutec-text">ou</span>
        </div>
      </div>

      <QRManualInput
        value={manualInput}
        onChange={onManualInputChange}
        onSubmit={onManualSubmit}
      />
    </div>
  );
};

export default QRInitialView;
