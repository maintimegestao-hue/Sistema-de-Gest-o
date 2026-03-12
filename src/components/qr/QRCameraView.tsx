
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { QrReader } from 'react-qr-reader';

interface QRCameraViewProps {
  onScan: (result: any, error: any) => void;
  onStop: () => void;
}

const QRCameraView: React.FC<QRCameraViewProps> = ({ onScan, onStop }) => {
  const readerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      // Cleanup ao desmontar componente
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
    if (result) {
      console.log('📸 QR Code lido:', result);
      onScan(result, null);
    }
    if (error && error.name !== 'NotFoundException') {
      console.error('Erro na leitura QR:', error);
      onScan(null, error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden" ref={readerRef}>
        <QrReader
          onResult={handleResult}
          constraints={{ 
            facingMode: 'environment',
            width: { ideal: 1920, max: 1920, min: 640 },
            height: { ideal: 1080, max: 1080, min: 480 }
          }}
          className="w-full"
          videoStyle={{
            width: '100%',
            height: '300px',
            objectFit: 'cover',
            transform: 'scaleX(-1)' // Mirror para melhor UX no mobile
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
        
        {/* Overlay com cantos para guiar o usuário */}
        <div className="absolute inset-4 border-2 border-green-400 rounded-lg pointer-events-none">
          <div className="absolute -top-1 -left-1 w-8 h-8 border-l-4 border-t-4 border-green-400 rounded-tl-lg"></div>
          <div className="absolute -top-1 -right-1 w-8 h-8 border-r-4 border-t-4 border-green-400 rounded-tr-lg"></div>
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-l-4 border-b-4 border-green-400 rounded-bl-lg"></div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-r-4 border-b-4 border-green-400 rounded-br-lg"></div>
        </div>

        {/* Linha central para ajudar no foco */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 border-2 border-green-400 border-dashed rounded-lg opacity-70 animate-pulse"></div>
        </div>
        
        {/* Texto de instrução sobreposto */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-white text-sm bg-black bg-opacity-50 rounded px-2 py-1">
            Mantenha o QR Code centralizado
          </p>
        </div>
      </div>
      
      <div className="text-center space-y-3">
        <div className="space-y-2">
          <p className="text-sm font-medium">📷 Posicione o QR Code do equipamento na área marcada</p>
          <p className="text-xs text-gray-500">
            • Mantenha a câmera estável<br/>
            • Aproxime ou afaste para melhor foco<br/>
            • Certifique-se de que há boa iluminação
          </p>
        </div>
        <Button onClick={onStop} variant="outline" className="w-full">
          ❌ Parar Escaneamento
        </Button>
      </div>
    </div>
  );
};

export default QRCameraView;
