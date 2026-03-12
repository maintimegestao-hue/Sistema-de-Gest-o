import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

export const useMobileCamera = () => {
  const isNative = Capacitor.isNativePlatform();

  const openCamera = async (): Promise<string | null> => {
    try {
      if (isNative) {
        // Usar API nativa do Capacitor
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
        });

        return image.dataUrl || null;
      } else {
        // Fallback para web usando getUserMedia
        return await openWebCamera();
      }
    } catch (error: any) {
      console.error('Erro ao acessar câmera:', error);
      
      if (error.message?.includes('User cancelled') || error.message?.includes('cancelled')) {
        toast.error('Câmera cancelada pelo usuário');
      } else {
        toast.error('Erro ao acessar câmera. Verifique as permissões.');
      }
      
      return null;
    }
  };

  const openWebCamera = async (): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      try {
        // Verificar se getUserMedia está disponível
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Câmera não suportada neste navegador');
        }

        // Criar elementos DOM temporários
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          } 
        }).then(stream => {
          video.srcObject = stream;
          video.play();

          video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Capturar frame após 2 segundos
            setTimeout(() => {
              context?.drawImage(video, 0, 0);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              
              // Parar stream
              stream.getTracks().forEach(track => track.stop());
              
              resolve(dataUrl);
            }, 2000);
          };
        }).catch(error => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  };

  const checkCameraPermissions = async (): Promise<boolean> => {
    try {
      if (isNative) {
        const permissions = await Camera.checkPermissions();
        return permissions.camera === 'granted';
      } else {
        // Para web, tentar acessar a câmera temporariamente
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          return true;
        } catch {
          return false;
        }
      }
    } catch {
      return false;
    }
  };

  const requestCameraPermissions = async (): Promise<boolean> => {
    try {
      if (isNative) {
        const permissions = await Camera.requestPermissions();
        return permissions.camera === 'granted';
      } else {
        // Para web, getUserMedia já solicita permissões
        return await checkCameraPermissions();
      }
    } catch {
      return false;
    }
  };

  return {
    openCamera,
    checkCameraPermissions,
    requestCameraPermissions,
    isNative
  };
};