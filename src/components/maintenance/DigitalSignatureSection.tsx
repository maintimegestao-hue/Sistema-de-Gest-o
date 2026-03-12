
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pen, Trash2, CheckCircle } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

interface DigitalSignatureSectionProps {
  signatureRef: React.RefObject<SignatureCanvas>;
  digitalSignature: string;
  onClearSignature: () => void;
  onSaveSignature: () => void;
}

const DigitalSignatureSection: React.FC<DigitalSignatureSectionProps> = ({
  signatureRef,
  digitalSignature,
  onClearSignature,
  onSaveSignature
}) => {
  const isSignatureSaved = Boolean(
    digitalSignature && 
    digitalSignature.trim() !== '' && 
    digitalSignature !== 'data:,' &&
    digitalSignature.includes('data:image')
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-evolutec-black mb-4 flex items-center">
        <Pen size={20} className="mr-2 text-evolutec-green" />
        Assinatura Digital do Responsável *
      </h3>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              width: 500,
              height: 200,
              className: 'signature-canvas w-full h-32 bg-white rounded border',
              style: { maxWidth: '100%', height: '150px' }
            }}
            backgroundColor="#ffffff"
            penColor="#000000"
          />
        </div>

        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClearSignature}
            className="flex items-center"
            disabled={isSignatureSaved}
          >
            <Trash2 size={16} className="mr-2" />
            Limpar Assinatura
          </Button>
          
          <Button
            type="button"
            onClick={onSaveSignature}
            className="evolutec-btn flex items-center"
            disabled={isSignatureSaved}
          >
            <Pen size={16} className="mr-2" />
            Salvar Assinatura
          </Button>
        </div>

        {isSignatureSaved && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle size={16} className="mr-2 text-green-600" />
            <p className="text-sm text-green-700">
              ✅ Assinatura digital registrada com sucesso!
            </p>
          </div>
        )}

        {!isSignatureSaved && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              ⚠️ Desenhe sua assinatura no campo acima e clique em "Salvar Assinatura"
            </p>
          </div>
        )}

        {digitalSignature && (
          <div className="mt-2">
            <p className="text-xs text-gray-500">Preview da assinatura:</p>
            <img src={digitalSignature} alt="Assinatura" className="max-w-full h-20 border rounded mt-1" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalSignatureSection;
