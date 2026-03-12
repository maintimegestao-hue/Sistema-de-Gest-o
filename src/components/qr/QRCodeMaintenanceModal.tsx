
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Wrench } from 'lucide-react';
import QRCodeScanner from './QRCodeScanner';
import { useNavigate } from 'react-router-dom';
import { useSecureEquipments } from '@/hooks/useSecureEquipments';
import { toast } from 'sonner';

interface QRCodeMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeMaintenanceModal: React.FC<QRCodeMaintenanceModalProps> = ({
  isOpen,
  onClose
}) => {
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const { data: equipments } = useSecureEquipments();

  const handleQRCodeDetected = (qrCode: string) => {
    console.log('QR Code detectado:', qrCode);
    
    // Encontrar o equipamento pelo QR code
    const equipment = equipments?.find(eq => eq.qr_code === qrCode);
    
    if (equipment) {
      toast.success(`Equipamento encontrado: ${equipment.name}`);
      onClose();
      // Navegar para a página de execução de manutenção com o equipamento pré-selecionado
      navigate('/execute-maintenance', { 
        state: { 
          selectedEquipmentId: equipment.id,
          equipmentName: equipment.name 
        } 
      });
    } else {
      toast.error('Equipamento não encontrado. Verifique o QR Code.');
    }
  };

  const handleManualEntry = () => {
    onClose();
    navigate('/execute-maintenance');
  };

  if (showScanner) {
    return (
      <QRCodeScanner
        onQRCodeDetected={handleQRCodeDetected}
        onClose={() => setShowScanner(false)}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>Executar Manutenção</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Escaneie o QR Code do equipamento para iniciar a manutenção rapidamente
          </p>
          
          <div className="flex flex-col space-y-3">
            <Button
              onClick={() => setShowScanner(true)}
              className="w-full evolutec-btn"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Escanear QR Code
            </Button>
            
            <Button
              variant="outline"
              onClick={handleManualEntry}
              className="w-full"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Selecionar Manualmente
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeMaintenanceModal;
