
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  value?: File | string;
  onChange: (file: File | null) => void;
  accept?: string;
  className?: string;
  required?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  accept = "image/*",
  className = "",
  required = false
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (value instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(value);
    } else if (typeof value === 'string' && value) {
      setPreview(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label} {required && '*'}</Label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-32 max-w-full mx-auto rounded"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-2">
              Clique para selecionar uma imagem
            </p>
            <Input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
              id={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById(`upload-${label.replace(/\s+/g, '-').toLowerCase()}`)?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Selecionar Imagem
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
