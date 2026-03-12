
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, Wrench } from 'lucide-react';
import QRCodeMaintenanceModal from '@/components/qr/QRCodeMaintenanceModal';

const QuickMaintenanceButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="maintex-btn w-full"
      >
        <QrCode className="w-4 h-4 mr-2" />
        Manutenção via QR Code
      </Button>

      <QRCodeMaintenanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default QuickMaintenanceButton;
