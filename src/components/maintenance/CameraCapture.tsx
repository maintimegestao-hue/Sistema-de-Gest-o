import React, { useRef, useState, useCallback } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const startCamera = useCallback(async () => {
    try {
      // Parar stream anterior se existir
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      };

      console.log('📷 Iniciando câmera com constraints:', constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsActive(true);
        console.log('📷 Câmera iniciada com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao acessar câmera:', error);
      toast.error('Erro ao acessar a câmera. Verifique as permissões.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Configurar o canvas com as dimensões do vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenhar o frame atual do vídeo no canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converter para blob e criar arquivo
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `evidencia_${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        onCapture(file);
        stopCamera();
        onClose();
        toast.success('📷 Foto capturada com sucesso!');
      }
    }, 'image/jpeg', 0.8);
  }, [isActive, onCapture, onClose, stopCamera]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Iniciar câmera quando o componente montar ou quando mudar o facing mode
  React.useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg overflow-hidden max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Capturar Evidência</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover bg-gray-900"
            autoPlay
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <p className="text-white">Carregando câmera...</p>
            </div>
          )}
        </div>
        
        <div className="p-4 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={switchCamera}
            disabled={!isActive}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Virar
          </Button>
          
          <Button
            onClick={capturePhoto}
            disabled={!isActive}
            className="bg-primary hover:bg-primary/90"
          >
            <Camera className="w-4 h-4 mr-2" />
            Capturar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;