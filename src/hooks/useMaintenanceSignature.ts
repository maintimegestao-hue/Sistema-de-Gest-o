
import { useToast } from '@/hooks/use-toast';
import SignatureCanvas from 'react-signature-canvas';

export const useMaintenanceSignature = (
  signatureRef: React.RefObject<SignatureCanvas>,
  setDigitalSignature: (value: string) => void
) => {
  const { toast } = useToast();

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setDigitalSignature('');
      console.log('🖊️ Assinatura limpa');
    }
  };

  const handleSaveSignature = () => {
    if (signatureRef.current) {
      if (signatureRef.current.isEmpty()) {
        toast({
          title: 'Erro',
          description: 'Por favor, desenhe sua assinatura antes de salvar.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const signatureData = signatureRef.current.toDataURL('image/png');
        console.log('🖊️ Salvando assinatura:', signatureData.substring(0, 50) + '...');
        
        if (signatureData && signatureData !== 'data:,' && signatureData.includes('data:image')) {
          setDigitalSignature(signatureData);
          toast({
            title: 'Assinatura salva!',
            description: 'Assinatura digital foi registrada com sucesso.',
          });
        } else {
          throw new Error('Dados da assinatura inválidos');
        }
      } catch (error) {
        console.error('Erro ao salvar assinatura:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao salvar a assinatura. Tente novamente.',
          variant: 'destructive',
        });
      }
    }
  };

  return {
    handleClearSignature,
    handleSaveSignature,
  };
};
