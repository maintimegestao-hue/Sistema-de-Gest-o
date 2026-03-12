import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera, QrCode } from 'lucide-react';
import { QrReader } from 'react-qr-reader';

interface ClientQRScannerProps {
  onQRCodeDetected: (qrCode: string) => void;
  onClose: () => void;
}

const ClientQRScanner: React.FC<ClientQRScannerProps> = ({ onQRCodeDetected, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');

  const handleScan = (result: any, error: any) => {
    if (result) {
      onQRCodeDetected(result?.text);
      setIsScanning(false);
    }
    if (error) {
      console.log('QR Scan error:', error);
    }
  };

  const handleError = (error: any) => {
    console.error('QR Reader error:', error);
    setError('Erro ao acessar a câmera. Verifique as permissões.');
    setIsScanning(false);
  };

  const startScanning = () => {
    setError('');
    setIsScanning(true);
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Scanner QR Code</h3>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="bg-black rounded-lg aspect-video flex items-center justify-center overflow-hidden">
        {!isScanning ? (
          <div className="text-center text-white">
            <QrCode className="w-16 h-16 mx-auto mb-4 opacity-60" />
            <p className="mb-4">Clique para iniciar o scanner</p>
            <Button onClick={startScanning} variant="secondary">
              <Camera className="w-4 h-4 mr-2" />
              Iniciar Scanner
            </Button>
          </div>
        ) : (
          <div className="w-full h-full">
            <QrReader
              onResult={handleScan}
              constraints={{
                facingMode: 'environment'
              }}
              containerStyle={{
                width: '100%',
                height: '100%'
              }}
              videoStyle={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-white/50 rounded-lg w-48 h-48"></div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Posicione o código QR dentro da área de visualização
        </p>
      </div>
    </div>
  );
};

export default ClientQRScanner;