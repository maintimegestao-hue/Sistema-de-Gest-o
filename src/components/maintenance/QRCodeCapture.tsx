import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, X, Camera, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { QrReader } from 'react-qr-reader';
import { Capacitor } from '@capacitor/core';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';

interface QRCodeCaptureProps {
  onQRCodeDetected: (qrCode: string, equipmentName?: string) => void;
  onClose: () => void;
}

const QRCodeCapture: React.FC<QRCodeCaptureProps> = ({
  onQRCodeDetected,
  onClose
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const readerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      // Cleanup camera on unmount
      if (readerRef.current) {
        try {
          const video = readerRef.current.querySelector('video');
          if (video && video.srcObject) {
            const tracks = video.srcObject.getTracks();
            tracks.forEach((track: MediaStreamTrack) => track.stop());
          }
        } catch (error) {
          console.log('Erro ao limpar câmera:', error);
        }
      }
    };
  }, []);

  const handleResult = (result: any, error?: any) => {
    if (result && !isProcessing) {
      setIsProcessing(true);
      const qrCode = result.text || result;
      console.log('📷 QR Code detectado:', qrCode);
      
      toast.success(`QR Code detectado: ${qrCode}`);
      onQRCodeDetected(qrCode);
      
      // Reset processing after delay
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 1000);
    }
    
    if (error && error.name !== 'NotFoundException') {
      console.error('Erro na leitura QR:', error);
      setError('Erro ao ler QR Code. Tente novamente.');
    }
  };

  const startScanning = async () => {
    try {
      setError('');
      setIsProcessing(false);
      
      // Check if running on mobile device
      const isNative = Capacitor.isNativePlatform();
      
      if (isNative) {
        // Use Capacitor Camera for native mobile
        toast.success('📷 Preparando câmera...');
        
        try {
          const image = await CapacitorCamera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Camera,
          });
          
          // For now, just show the image and ask user to manually input QR code
          // In a real implementation, you'd use a QR code reading library
          toast.success('📷 Foto capturada! Digite o código QR manualmente se necessário.');
          
        } catch (err: any) {
          console.error('❌ Erro ao acessar câmera nativa:', err);
          setError('❌ Erro ao acessar a câmera. Verifique as permissões nas configurações do app.');
          toast.error('Erro ao acessar câmera');
        }
        
      } else {
        // Use web camera for browser
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Câmera não suportada');
        }
        
        toast.success('📷 Preparando câmera...');
        
        // Test camera access
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 }
          } 
        });
        
        // Stop test stream
        stream.getTracks().forEach(track => track.stop());
        
        setIsScanning(true);
        toast.success('📷 Posicione o QR Code na área marcada');
      }
      
    } catch (err: any) {
      console.error('❌ Erro ao acessar câmera:', err);
      
      let errorMessage = '';
      if (err.name === 'NotAllowedError') {
        errorMessage = '❌ Permissão de câmera negada. Verifique as configurações do navegador.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = '❌ Nenhuma câmera encontrada no dispositivo.';
      } else {
        errorMessage = '❌ Erro ao acessar a câmera. Verifique as permissões.';
      }
      
      setError(errorMessage);
      toast.error('Erro ao acessar câmera. Verifique as permissões.');
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Ler QR Code do Equipamento
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {!isScanning && !error && (
          <div className="space-y-4 text-center">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <h4 className="font-medium mb-2">Escanear QR Code</h4>
              <p className="text-sm text-gray-600 mb-4">
                {Capacitor.isNativePlatform() ? 
                  'Clique no botão abaixo para abrir a câmera e escanear o QR Code do equipamento.' :
                  'Clique no botão abaixo para ativar a câmera e escanear o QR Code do equipamento.'
                }
              </p>
              <Button onClick={startScanning} className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                {Capacitor.isNativePlatform() ? 'Abrir Câmera' : 'Ativar Câmera'}
              </Button>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden" ref={readerRef}>
              <QrReader
                onResult={handleResult}
                constraints={{ 
                  facingMode: 'environment',
                  width: { ideal: 1920, min: 640 },
                  height: { ideal: 1080, min: 480 }
                }}
                className="w-full"
                videoStyle={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover'
                }}
                containerStyle={{
                  width: '100%',
                  height: '300px',
                  position: 'relative',
                  background: '#000'
                }}
                videoContainerStyle={{
                  width: '100%',
                  height: '100%',
                  paddingTop: '0'
                }}
              />
              
              {/* QR scanning overlay */}
              <div className="absolute inset-4 border-2 border-green-400 rounded-lg pointer-events-none">
                <div className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-green-400 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-green-400 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-green-400 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-green-400 rounded-br-lg"></div>
              </div>

              {/* Center guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 border-2 border-green-400 border-dashed rounded-lg opacity-70 animate-pulse"></div>
              </div>
              
              {/* Instructions */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-white text-sm bg-black bg-opacity-50 rounded px-2 py-1">
                  Posicione o QR Code na área marcada
                </p>
              </div>
            </div>
            
            <div className="text-center space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium">📷 Mantenha o QR Code centralizado</p>
                <p className="text-xs text-gray-500">
                  • Aproxime ou afaste para melhor foco<br/>
                  • Certifique-se de que há boa iluminação
                </p>
              </div>
              <Button onClick={stopScanning} variant="outline" className="w-full">
                Parar Escaneamento
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-4 text-center">
            <div className="w-24 h-24 mx-auto bg-red-100 rounded-lg flex items-center justify-center">
              <X className="w-12 h-12 text-red-500" />
            </div>
            <div>
              <h4 className="font-medium mb-2 text-red-600">Erro ao acessar câmera</h4>
              <p className="text-sm text-gray-600 mb-4 whitespace-pre-line">
                {error}
              </p>
              <div className="space-y-2">
                <Button onClick={startScanning} variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button onClick={onClose} variant="ghost" className="w-full">
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeCapture;