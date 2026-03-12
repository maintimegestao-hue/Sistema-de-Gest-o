
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import MaintenanceTypeSelector from './MaintenanceTypeSelector';
import PeriodicitySelector from './PeriodicitySelector';
import QRCodeCapture from './QRCodeCapture';

interface BasicInfoSectionProps {
  maintenanceType: string;
  setMaintenanceType: (value: string) => void;
  periodicity: string;
  setPeriodicity: (value: string) => void;
  onMaintenanceTypeReset: () => void;
  onPeriodicityReset: () => void;
  disabled?: boolean;
  selectedEquipmentName?: string;
  onQRCodeDetected?: (qrCode: string) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  maintenanceType,
  setMaintenanceType,
  periodicity,
  setPeriodicity,
  onMaintenanceTypeReset,
  onPeriodicityReset,
  disabled = false,
  selectedEquipmentName,
  onQRCodeDetected
}) => {
  const [showQRCapture, setShowQRCapture] = useState(false);
  
  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-evolutec-black mb-4">Informações Básicas</h3>
        
        {selectedEquipmentName && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              Equipamento selecionado: <span className="font-semibold">{selectedEquipmentName}</span>
            </p>
          </div>
        )}

        {!selectedEquipmentName && onQRCodeDetected && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-800">
                📱 Escanear QR Code do Equipamento
              </p>
              <Button 
                onClick={() => setShowQRCapture(true)}
                size="sm"
                variant="outline"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Escanear
              </Button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <MaintenanceTypeSelector
              value={maintenanceType}
              onChange={(value) => {
                setMaintenanceType(value);
                onMaintenanceTypeReset();
              }}
              disabled={disabled}
            />
          </div>

          <div className="space-y-4">
            {maintenanceType === 'preventive' && (
              <PeriodicitySelector
                value={periodicity}
                onChange={(value) => {
                  setPeriodicity(value);
                  onPeriodicityReset();
                }}
                disabled={disabled}
              />
            )}
          </div>
        </div>
      </div>

      {showQRCapture && (
        <QRCodeCapture
          onQRCodeDetected={(qrCode) => {
            onQRCodeDetected?.(qrCode);
            setShowQRCapture(false);
          }}
          onClose={() => setShowQRCapture(false)}
        />
      )}
    </div>
  );
};

export default BasicInfoSection;
