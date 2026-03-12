
import React, { useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { toast } from 'sonner';
import CameraCapture from './CameraCapture';

interface Attachment {
  file: File;
  comment: string;
  type: 'photo' | 'video';
}

interface EvidenceSectionProps {
  attachments: Attachment[];
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
}

const EvidenceSection: React.FC<EvidenceSectionProps> = ({
  attachments,
  setAttachments
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const fileType = file.type.startsWith('image/') ? 'photo' : 'video';
      
      const maxSize = fileType === 'photo' ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`Arquivo muito grande. Máximo ${fileType === 'photo' ? '5MB' : '20MB'}.`);
        return;
      }

      setAttachments(prev => [...prev, { file, comment: '', type: fileType }]);
    }
  };

  const updateAttachmentComment = (index: number, comment: string) => {
    setAttachments(prev => prev.map((att, i) => i === index ? { ...att, comment } : att));
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleCameraCapture = (file: File) => {
    setAttachments(prev => [...prev, { file, comment: '', type: 'photo' }]);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-evolutec-black mb-4">
        Evidências Visuais
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
          >
            <Camera size={16} />
            <span>Tirar Foto</span>
          </button>
          
          <input
            type="file"
            id="file-upload"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center space-x-2 px-4 py-2 border border-secondary text-secondary rounded-lg hover:bg-secondary hover:text-white transition-colors cursor-pointer"
          >
            <Upload size={16} />
            <span>Anexar Arquivo</span>
          </label>
          <p className="text-sm text-muted-foreground">
            Máx: 5MB (fotos) / 20MB (vídeos)
          </p>
        </div>

        {attachments.map((attachment, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-evolutec-black">
                {attachment.type === 'photo' ? '📷' : '🎥'} {attachment.file.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
            <textarea
              value={attachment.comment}
              onChange={(e) => updateAttachmentComment(index, e.target.value)}
              placeholder="Adicione um comentário para esta evidência..."
              className="w-full p-2 border border-gray-200 rounded text-sm resize-none"
              rows={2}
              required
            />
          </div>
        ))}
      </div>
      
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default EvidenceSection;
