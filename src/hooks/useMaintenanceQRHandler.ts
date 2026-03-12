
import { useSecureEquipments } from '@/hooks/useSecureEquipments';
import { useToast } from '@/hooks/use-toast';

export const useMaintenanceQRHandler = (
  setSelectedEquipment: (value: string) => void,
  setShowQRScanner: (value: boolean) => void
) => {
  const { toast } = useToast();
  const { data: equipments } = useSecureEquipments();

  const handleQRCodeDetected = (qrCode: string) => {
    console.log('🔍 Processando QR Code detectado:', qrCode);
    
    // Extrair ID da URL se for uma URL completa
    let equipmentId = qrCode;
    if (qrCode.includes('/public-maintenance/')) {
      const match = qrCode.match(/\/public-maintenance\/([a-f0-9-]+)/);
      if (match) {
        equipmentId = match[1];
        console.log('🔗 ID extraído da URL:', equipmentId);
      }
    }
    
    const equipment = equipments?.find(eq => 
      eq.qr_code === equipmentId || 
      eq.id === equipmentId ||
      eq.qr_code === qrCode ||
      eq.id === qrCode ||
      eq.name.toLowerCase().includes(equipmentId.toLowerCase())
    );
    
    if (equipment) {
      console.log('✅ Equipamento encontrado:', equipment);
      setSelectedEquipment(equipment.id);
      setShowQRScanner(false);
      toast({
        title: 'QR Code detectado!',
        description: `Equipamento "${equipment.name}" selecionado automaticamente.`,
      });
    } else {
      console.log('❌ Equipamento não encontrado para QR Code:', qrCode);
      toast({
        title: 'Erro',
        description: 'Equipamento não encontrado para este QR Code.',
        variant: 'destructive',
      });
    }
  };

  return {
    handleQRCodeDetected,
  };
};
