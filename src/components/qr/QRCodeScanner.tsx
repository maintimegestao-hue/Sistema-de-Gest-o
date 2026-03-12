
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useFieldEquipments } from '@/hooks/useFieldEquipments';
import { useMobileCamera } from '@/hooks/useMobileCamera';
import { toast } from 'sonner';
import QRInitialView from './QRInitialView';
import QRCameraView from './QRCameraView';
import QRScannerStatus from './QRScannerStatus';
import { Capacitor } from '@capacitor/core';

interface QRCodeScannerProps {
  onQRCodeDetected: (qrCode: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onQRCodeDetected, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [detectedCode, setDetectedCode] = useState<string>('');
  const [manualInput, setManualInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: equipments } = useFieldEquipments();
  const { openCamera, checkCameraPermissions, requestCameraPermissions, isNative } = useMobileCamera();

  const findEquipment = (qrCode: string) => {
    if (!equipments || !Array.isArray(equipments)) return null;
    
    // Extrair ID da URL se for uma URL completa
    let equipmentId = qrCode;
    if (qrCode.includes('/public-maintenance/')) {
      const match = qrCode.match(/\/public-maintenance\/([a-f0-9-]+)/);
      if (match) {
        equipmentId = match[1];
        console.log('🔗 ID extraído da URL:', equipmentId);
      }
    }
    
    return equipments.find(eq => 
      eq.qr_code === equipmentId || 
      eq.id === equipmentId ||
      eq.qr_code === qrCode ||
      eq.id === qrCode ||
      eq.name.toLowerCase().includes(equipmentId.toLowerCase())
    );
  };

  const handleEquipmentFound = (qrCode: string, equipment: any) => {
    setDetectedCode(qrCode);
    setIsScanning(false); // Para a câmera imediatamente
    console.log('✅ Equipamento encontrado:', equipment.name);
    toast.success(`✅ Equipamento identificado: ${equipment.name}`, {
      duration: 2000
    });
    
    // Fechar imediatamente e chamar callback
    setTimeout(() => {
      onQRCodeDetected(equipment.qr_code || equipment.id);
    }, 500);
  };

  const handleEquipmentNotFound = (qrCode: string) => {
    setError(`❌ QR Code ou equipamento não encontrado: ${qrCode}`);
    toast.error('❌ Equipamento não encontrado no sistema');
    setIsScanning(false);
  };

  const handleScan = (result: any, error: any) => {
    // Só processar se ainda estiver escaneando e não encontrou código ainda
    if (result && isScanning && !detectedCode && !isProcessing) {
      setIsProcessing(true);
      const qrCode = result.text || result;
      console.log('🔍 QR Code detectado:', qrCode);
      
      const equipment = findEquipment(qrCode);
      
      if (equipment) {
        handleEquipmentFound(qrCode, equipment);
      } else {
        console.log('❌ Equipamento não encontrado para QR Code:', qrCode);
        handleEquipmentNotFound(qrCode);
      }
      
      // Reset processing após um delay
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    }
    
    if (error && error.name !== 'NotAllowedError' && isScanning) {
      console.error('Erro no scan:', error);
      setError('❌ Erro ao acessar a câmera. Verifique as permissões.');
      setIsScanning(false);
    }
  };

  const startCamera = async () => {
    try {
      setError('');
      setDetectedCode('');
      setIsProcessing(false);
      
      console.log('🎥 Iniciando processo da câmera...');
      
      // Verificar se é mobile nativo
      if (isNative) {
        console.log('📱 Detectado ambiente nativo - usando Capacitor Camera');
        
        // Verificar permissões primeiro
        const hasPermission = await checkCameraPermissions();
        if (!hasPermission) {
          console.log('📱 Solicitando permissões de câmera...');
          const granted = await requestCameraPermissions();
          if (!granted) {
            setError('❌ Permissão de câmera necessária.\n\n📱 Para permitir acesso:\n• Vá em Configurações do celular\n• Procure por "Evolutec" ou este app\n• Ative a permissão "Câmera"\n• Reabra o aplicativo\n\nOu digite o código manualmente:');
            return;
          }
        }
        
        toast.success('📷 Câmera autorizada! Ativando scanner...');
        setIsScanning(true);
        return;
      } else {
        // Usar web camera
        console.log('🌐 Usando câmera web...');
        
        // Verificar se getUserMedia está disponível
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Câmera não suportada neste navegador');
        }
        
        // Mostrar loading primeiro
        toast.success('📷 Preparando câmera...');
        
        // Aguardar tempo adequado para mostrar o loading e dar tempo para user se posicionar
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        console.log('🎥 Solicitando permissão da câmera...');
        
        // Solicitar permissão da câmera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          } 
        });
        
        // Parar o stream imediatamente (só estava testando permissões)
        stream.getTracks().forEach(track => track.stop());
        
        console.log('✅ Permissão da câmera concedida');
        
        // Aguardar mais um pouco antes de ativar o scanner
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        setIsScanning(true);
        toast.success('📷 Câmera ativada! Posicione o QR Code na área marcada');
      }
    } catch (err: any) {
      console.error('❌ Erro ao acessar câmera:', err);
      
      let errorMessage = '';
      
      if (err.name === 'NotAllowedError' || err.message?.includes('negada')) {
        if (isNative) {
          errorMessage = '❌ Permissão de câmera negada.\n\n📱 Para usar a câmera no APP:\n• Vá em Configurações do seu celular\n• Procure "Evolutec" ou "Permissões de apps"\n• Ative a permissão de "Câmera"\n• Feche e abra o app novamente\n\nOu digite o código manualmente abaixo:';
        } else {
          // Detectar se é mobile para mostrar instruções específicas
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          
          if (isMobile) {
            errorMessage = '❌ Permissão de câmera negada.\n\nPara permitir o acesso no CELULAR:\n\n📱 Para ANDROID (Chrome):\n• Toque no ícone 🔒 ao lado da URL\n• Selecione "Configurações do site"\n• Ative "Câmera"\n• Recarregue a página\n\n📱 Para IPHONE (Safari):\n• Toque em "aA" na barra de endereços\n• Selecione "Configurações do site"\n• Ative "Câmera"\n• Recarregue a página\n\n📱 Para outros navegadores:\n• Procure o ícone de câmera ou cadeado\n• Ative as permissões de câmera\n• Recarregue a página\n\nOu digite o código manualmente abaixo:';
          } else {
            errorMessage = '❌ Permissão de câmera negada.\n\nPara permitir o acesso no COMPUTADOR:\n\n🖥️ No Chrome/Edge:\n• Clique no ícone 🔒 ou 📷 na barra de endereços\n• Selecione "Sempre permitir" para Câmera\n• Recarregue a página\n\n🖥️ No Firefox:\n• Clique no ícone 🎥 na barra de endereços\n• Selecione "Permitir" para Câmera\n• Recarregue a página\n\n🖥️ No Safari:\n• Vá em Safari > Configurações > Sites > Câmera\n• Altere para "Permitir"\n\nOu digite o código manualmente abaixo:';
          }
        }
      } else if (err.name === 'NotFoundError') {
        errorMessage = '❌ Nenhuma câmera encontrada no dispositivo. Use a entrada manual abaixo.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = '❌ Câmera não suportada neste navegador. Use a entrada manual abaixo.';
      } else {
        errorMessage = '❌ Erro ao acessar a câmera. Use a entrada manual abaixo.';
      }
      
      setError(errorMessage);
      toast.error('Erro ao acessar câmera');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    console.log('🎥 Parando câmera...');
    setIsScanning(false);
  };

  const handleManualInput = () => {
    if (!manualInput.trim()) {
      setError('❌ Digite um código válido');
      toast.error('Digite um código válido');
      return;
    }

    console.log('🔍 Verificando código manual:', manualInput.trim());
    
    const equipment = findEquipment(manualInput.trim());
    
    if (equipment) {
      handleEquipmentFound(manualInput.trim(), equipment);
    } else {
      handleEquipmentNotFound(manualInput.trim());
    }
  };

  const handleRetry = () => {
    setError('');
    setDetectedCode('');
    setManualInput('');
    setIsScanning(false);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-evolutec-black">
            📷 Escanear QR Code do Equipamento
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        {/* Mostrar aviso sobre ambiente */}
        {!isNative && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              📱 <strong>Dica:</strong> No app móvel nativo, a câmera funciona melhor. No navegador, certifique-se de permitir acesso à câmera.
            </p>
          </div>
        )}

        {/* Aviso específico para técnicos */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-800">
            <strong>👷‍♂️ Para Técnicos:</strong><br/>
            • Mantenha o QR code limpo e bem iluminado<br/>
            • Posicione a câmera a 10-30cm do código<br/>
            • Se não funcionar, digite o código manualmente
          </p>
        </div>

        {!isScanning && !detectedCode && !error && (
          <QRInitialView
            onStartCamera={startCamera}
            manualInput={manualInput}
            onManualInputChange={setManualInput}
            onManualSubmit={handleManualInput}
          />
        )}

        {isScanning && (
          <QRCameraView
            onScan={handleScan}
            onStop={stopCamera}
          />
        )}

        {error && (
          <QRScannerStatus
            type="error"
            message={error}
            onRetry={handleRetry}
            onClose={onClose}
          />
        )}

        {detectedCode && (
          <QRScannerStatus
            type="success"
            message="✅ QR Code detectado com sucesso!"
            detectedCode={detectedCode}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;
