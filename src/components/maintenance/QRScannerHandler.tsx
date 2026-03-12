
import React from 'react';
import QRCodeScanner from '@/components/qr/QRCodeScanner';

interface QRScannerHandlerProps {
  showQRScanner: boolean;
  onClose: () => void;
  onQRCodeDetected: (qrCode: string) => void;
}

const QRScannerHandler: React.FC<QRScannerHandlerProps> = ({
  showQRScanner,
  onClose,
  onQRCodeDetected
}) => {
  if (!showQRScanner) return null;

  return (
    <QRCodeScanner
      onQRCodeDetected={onQRCodeDetected}
      onClose={onClose}
    />
  );
};

export default QRScannerHandler;
