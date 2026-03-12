
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, RotateCcw } from 'lucide-react';

interface QRScannerStatusProps {
  type: 'error' | 'success';
  message: string;
  detectedCode?: string;
  onRetry?: () => void;
  onClose: () => void;
}

const QRScannerStatus: React.FC<QRScannerStatusProps> = ({
  type,
  message,
  detectedCode,
  onRetry,
  onClose
}) => {
  if (type === 'success' && detectedCode) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle size={48} className="mx-auto text-evolutec-green" />
        <div>
          <p className="text-evolutec-black font-semibold">QR Code detectado!</p>
          <p className="text-evolutec-text">Código: {detectedCode}</p>
          <p className="text-sm text-evolutec-text">Fechando automaticamente...</p>
        </div>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="space-y-4">
        <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm whitespace-pre-line">{message}</p>
        </div>
        <div className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry} className="evolutec-btn flex-1">
              <RotateCcw size={16} className="mr-2" />
              Tentar Novamente
            </Button>
          )}
          <Button onClick={onClose} variant="outline" className="flex-1">
            Fechar
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default QRScannerStatus;
