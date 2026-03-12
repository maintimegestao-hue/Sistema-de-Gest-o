
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeLabelProps {
  equipment: {
    id: string;
    name: string;
    qr_code?: string;
    installation_location?: string;
    serial_number?: string;
  };
  onClose: () => void;
}

const QRCodeLabel: React.FC<QRCodeLabelProps> = ({ equipment, onClose }) => {
  // URL pública para acesso direto ao checklist
  const publicUrl = `${window.location.origin}/public-maintenance/${equipment.id}`;
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const qrCodeElement = document.getElementById('qr-code-canvas');
      const svg = qrCodeElement?.querySelector('svg');
      const serializer = new XMLSerializer();
      const svgString = svg ? serializer.serializeToString(svg) : '';

      printWindow.document.write(`
        <html>
          <head>
            <title>Etiqueta QR Code - ${equipment.name}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              .label {
                border: 2px solid #000;
                padding: 20px;
                text-align: center;
                max-width: 300px;
                background: white;
              }
              .equipment-name {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
                word-wrap: break-word;
              }
              .qr-code {
                margin: 15px 0;
              }
              .info {
                font-size: 12px;
                margin-top: 10px;
                color: #666;
                line-height: 1.4;
              }
              .url {
                font-size: 10px;
                color: #999;
                margin-top: 8px;
                word-break: break-all;
              }
              @media print {
                body { margin: 0; }
                .label { border: 2px solid #000; }
              }
            </style>
          </head>
          <body>
            <div class="label">
              <div class="equipment-name">${equipment.name}</div>
              <div class="qr-code">
                ${svgString}
              </div>
              <div class="info">
                <div><strong>Código:</strong> ${equipment.qr_code || equipment.id.slice(-8)}</div>
                ${equipment.serial_number ? `<div><strong>Série:</strong> ${equipment.serial_number}</div>` : ''}
                ${equipment.installation_location ? `<div><strong>Local:</strong> ${equipment.installation_location}</div>` : ''}
                <div style="margin-top: 10px;"><strong>Escaneie para registrar manutenção</strong></div>
              </div>
              <div class="url">${publicUrl}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 500;

    // Fill background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Add equipment name
    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    const nameLines = equipment.name.match(/.{1,25}/g) || [equipment.name];
    nameLines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, 50 + (index * 25));
    });

    // Get QR code SVG and convert to image
    const qrCodeElement = document.getElementById('qr-code-canvas');
    const svg = qrCodeElement?.querySelector('svg');
    if (svg) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        const qrSize = 150;
        const qrX = (canvas.width - qrSize) / 2;
        const qrY = 100 + (nameLines.length * 25);
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

        // Add info text
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        let yPos = qrY + qrSize + 30;

        ctx.fillText(`Código: ${equipment.qr_code || equipment.id.slice(-8)}`, canvas.width / 2, yPos);
        yPos += 20;

        if (equipment.serial_number) {
          ctx.fillText(`Série: ${equipment.serial_number}`, canvas.width / 2, yPos);
          yPos += 20;
        }

        if (equipment.installation_location) {
          const locationLines = equipment.installation_location.match(/.{1,30}/g) || [equipment.installation_location];
          locationLines.forEach(line => {
            ctx.fillText(`Local: ${line}`, canvas.width / 2, yPos);
            yPos += 20;
          });
        }

        yPos += 10;
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Escaneie para registrar manutenção', canvas.width / 2, yPos);

        // Download the canvas as image
        const link = document.createElement('a');
        link.download = `qr-label-${equipment.name.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Etiqueta QR Code
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">{equipment.name}</h3>
            
            <div id="qr-code-canvas" className="flex justify-center">
              <QRCodeSVG 
                value={publicUrl}
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Código:</strong> {equipment.qr_code || equipment.id.slice(-8)}</p>
              {equipment.serial_number && (
                <p><strong>Série:</strong> {equipment.serial_number}</p>
              )}
              {equipment.installation_location && (
                <p><strong>Local:</strong> {equipment.installation_location}</p>
              )}
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Escaneie para acesso direto ao checklist de manutenção
              </p>
              <p className="text-xs text-blue-600 mt-1 break-all">
                {publicUrl}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handlePrint}
              className="flex-1"
              variant="outline"
            >
              <Printer size={16} className="mr-2" />
              Imprimir
            </Button>
            <Button
              onClick={handleDownload}
              className="flex-1"
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeLabel;
