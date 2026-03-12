import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera, Flashlight, RotateCcw } from 'lucide-react';
import { useFieldEquipments } from '@/hooks/useFieldEquipments';
import { useMobileCamera } from '@/hooks/useMobileCamera';
import { toast } from 'sonner';
import QRCameraView from './QRCameraView';
import { Capacitor } from '@capacitor/core';

interface QRFieldScannerProps {
  onQRCodeDetected: (qrCode: string) => void;
  onClose: () => void;
}

const QRFieldScanner: React.FC<QRFieldScannerProps> = ({ onQRCodeDetected, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [detectedCode, setDetectedCode] = useState<string>('');
  const [manualInput, setManualInput] = useState<string>('');
  const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied' | 'prompt'>('checking');
  const { data: equipments } = useFieldEquipments();
  const { openCamera, checkCameraPermissions, requestCameraPermissions, isNative } = useMobileCamera();

  // Verificar permissões ao carregar
  useEffect(() => {
    checkInitialPermissions();
  }, []);

  const checkInitialPermissions = async () => {
    try {
      const hasPermission = await checkCameraPermissions();
      setPermissionStatus(hasPermission ? 'granted' : 'prompt');
    } catch (error) {
      setPermissionStatus('prompt');
    }
  };

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

  const handleQRCodeDetected = (qrCode: string) => {
    const equipment = findEquipment(qrCode);
    
    if (equipment) {
      setDetectedCode(qrCode);
      setIsScanning(false);
      toast.success(`✅ Equipamento encontrado: ${equipment.name}`);
      
      // Fechar imediatamente e chamar callback
      setTimeout(() => {
        onQRCodeDetected(equipment.qr_code || equipment.id);
        onClose();
      }, 500);
    } else {
      toast.error('❌ Equipamento não encontrado');
      setError(`Equipamento não encontrado para: ${qrCode}`);
    }
  };

  const handleScan = (result: any, error: any) => {
    if (result && isScanning && !detectedCode) {
      const qrCode = result.text || result;
      handleQRCodeDetected(qrCode);
    }
    
    if (error && error.name !== 'NotAllowedError' && isScanning) {
      console.error('Erro no scan:', error);
      toast.error('Erro ao escanear');
    }
  };

  const requestPermissions = async () => {
    try {
      setPermissionStatus('checking');
      const granted = await requestCameraPermissions();
      
      if (granted) {
        setPermissionStatus('granted');
        toast.success('✅ Permissão concedida!');
      } else {
        setPermissionStatus('denied');
        setError('Permissão de câmera negada. Ative nas configurações do dispositivo.');
      }
    } catch (error) {
      setPermissionStatus('denied');
      setError('Erro ao solicitar permissões');
    }
  };

  const startScanning = () => {
    setError('');
    setDetectedCode('');
    setIsScanning(true);
    toast.success('📷 Scanner ativado! Posicione o QR code');
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      toast.error('Digite um código válido');
      return;
    }
    
    handleQRCodeDetected(manualInput.trim());
  };

  const handleRetry = () => {
    setError('');
    setDetectedCode('');
    setManualInput('');
    setIsScanning(false);
    checkInitialPermissions();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-evolutec-black">
            👷‍♂️ Scanner de Campo
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        {/* Instruções para técnicos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>📋 Instruções:</strong><br/>
            • Limpe o QR code antes de escanear<br/>
            • Mantenha distância de 10-30cm<br/>
            • Garanta boa iluminação<br/>
            • Se não funcionar, digite o código
          </p>
        </div>

        {/* Status das permissões */}
        {permissionStatus === 'checking' && (
          <div className="text-center py-4">
            <p className="text-evolutec-text">Verificando permissões...</p>
          </div>
        )}

        {permissionStatus === 'prompt' && (
          <div className="space-y-4">
            <Button onClick={requestPermissions} className="w-full evolutec-btn">
              <Camera className="mr-2 h-4 w-4" />
              Permitir Acesso à Câmera
            </Button>
          </div>
        )}

        {permissionStatus === 'granted' && !isScanning && !detectedCode && !error && (
          <div className="space-y-4">
            <Button onClick={startScanning} className="w-full evolutec-btn">
              <Camera className="mr-2 h-4 w-4" />
              Iniciar Scanner
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-evolutec-text">ou</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-evolutec-black">
                Digite o código manualmente:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="EQ-001 ou nome do equipamento"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-evolutec-green focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualSubmit();
                    }
                  }}
                />
                <Button onClick={handleManualSubmit} className="evolutec-btn">
                  OK
                </Button>
              </div>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <QRCameraView onScan={handleScan} onStop={stopScanning} />
            <Button onClick={stopScanning} variant="outline" className="w-full">
              Parar Scanner
            </Button>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRetry} className="evolutec-btn flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                Fechar
              </Button>
            </div>
          </div>
        )}

        {detectedCode && (
          <div className="text-center space-y-4">
            <div className="text-green-600">
              <Camera size={48} className="mx-auto mb-2" />
              <p className="font-semibold">✅ QR Code detectado!</p>
              <p className="text-sm">Carregando equipamento...</p>
            </div>
          </div>
        )}

        {permissionStatus === 'denied' && (
          <div className="space-y-4">
            <div className="p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>📱 Permissão necessária:</strong><br/>
                Vá em Configurações → Aplicativos → Evolutec → Permissões → Câmera → Permitir
              </p>
            </div>
            <Button onClick={handleRetry} className="w-full evolutec-btn">
              Verificar Novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRFieldScanner;