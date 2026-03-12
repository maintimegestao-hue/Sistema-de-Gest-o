import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRFieldScanner from '@/components/qr/QRFieldScanner';
import FieldMaintenanceExecutor from './FieldMaintenanceExecutor';
import { useFieldEquipments } from '@/hooks/useFieldEquipments';
import { useToast } from '@/hooks/use-toast';

interface FieldQRScannerProps {
  onBack: () => void;
  onEquipmentSelect: (equipment: any) => void;
}

const FieldQRScanner: React.FC<FieldQRScannerProps> = ({ onBack, onEquipmentSelect }) => {
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const { data: equipments } = useFieldEquipments();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleQRCodeDetected = (qrCode: string) => {
    console.log('🔍 QR Code detectado no campo:', qrCode);
    
    if (!equipments || !Array.isArray(equipments)) {
      console.log('❌ Lista de equipamentos não disponível');
      return;
    }
    
    // Extrair ID da URL se for uma URL completa
    let equipmentId = qrCode;
    if (qrCode.includes('/public-maintenance/')) {
      const match = qrCode.match(/\/public-maintenance\/([a-f0-9-]+)/);
      if (match) {
        equipmentId = match[1];
        console.log('🔗 ID extraído da URL:', equipmentId);
      }
    }
    
    const equipment = equipments.find(eq => 
      eq.qr_code === equipmentId || 
      eq.id === equipmentId ||
      eq.qr_code === qrCode ||
      eq.id === qrCode ||
      eq.name.toLowerCase().includes(equipmentId.toLowerCase())
    );
    
    if (equipment) {
      console.log('✅ Equipamento encontrado:', equipment);
      toast({
        title: 'Equipamento encontrado!',
        description: `${equipment.name} selecionado para manutenção.`,
      });
      
      // Navegar para a página de campo técnico com execução de manutenção
      navigate('/field-access', { 
        state: { 
          selectedEquipment: equipment.id,
          viewMode: 'execute',
          fromQRScan: true 
        } 
      });
    } else {
      console.log('❌ Equipamento não encontrado para QR Code:', qrCode);
      toast({
        title: 'Equipamento não encontrado',
        description: 'QR Code não corresponde a nenhum equipamento cadastrado.',
        variant: 'destructive',
      });
    }
  };

  if (selectedEquipment) {
    return (
      <FieldMaintenanceExecutor
        equipment={selectedEquipment}
        onBack={() => setSelectedEquipment(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold">Escanear QR Code</h2>
      </div>

      <QRFieldScanner
        onQRCodeDetected={handleQRCodeDetected}
        onClose={onBack}
      />
    </div>
  );
};

export default FieldQRScanner;