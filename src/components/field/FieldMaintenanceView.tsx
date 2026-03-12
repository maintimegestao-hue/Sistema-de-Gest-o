import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, List, Plus, History } from 'lucide-react';
import FieldEquipmentSelector from './FieldEquipmentSelector';
import FieldQRScanner from './FieldQRScanner';
import FieldMaintenanceHistory from './FieldMaintenanceHistory';
import FieldMaintenanceExecutor from './FieldMaintenanceExecutor';
import { useFieldEquipments } from '@/hooks/useFieldEquipments';

type ViewMode = 'menu' | 'manual' | 'qr' | 'history' | 'execute';

const FieldMaintenanceView = () => {
  const location = useLocation();
  const { data: equipments } = useFieldEquipments();
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [selectedEquipmentForExecution, setSelectedEquipmentForExecution] = useState<any>(null);

  // Processar parâmetros da navegação para QR Code escaneado
  useEffect(() => {
    const state = location.state as any;
    if (state?.selectedEquipment && state?.viewMode === 'execute' && state?.fromQRScan) {
      console.log('🔍 Processando equipamento do QR scan:', state.selectedEquipment);
      
      if (equipments) {
        const equipment = equipments.find(eq => eq.id === state.selectedEquipment);
        if (equipment) {
          console.log('✅ Equipamento encontrado para execução:', equipment);
          setSelectedEquipmentForExecution(equipment);
          setViewMode('execute');
        }
      }
    }
  }, [location.state, equipments]);

  const handleEquipmentSelected = (equipment: any) => {
    setSelectedEquipmentForExecution(equipment);
    setViewMode('execute');
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'manual':
        return <FieldEquipmentSelector onBack={() => setViewMode('menu')} onEquipmentSelect={handleEquipmentSelected} />;
      case 'qr':
        return <FieldQRScanner onBack={() => setViewMode('menu')} onEquipmentSelect={handleEquipmentSelected} />;
      case 'history':
        return <FieldMaintenanceHistory onBack={() => setViewMode('menu')} />;
      case 'execute':
        return (
          <FieldMaintenanceExecutor 
            equipment={selectedEquipmentForExecution}
            onBack={() => {
              setViewMode('menu');
              setSelectedEquipmentForExecution(null);
            }}
          />
        );
      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Selecione uma Opção</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setViewMode('qr')}
                  className="w-full h-20 text-lg"
                  variant="default"
                >
                  <QrCode className="w-8 h-8 mr-3" />
                  Escanear QR Code
                </Button>
                
                <Button
                  onClick={() => setViewMode('manual')}
                  className="w-full h-20 text-lg"
                  variant="outline"
                >
                  <List className="w-8 h-8 mr-3" />
                  Selecionar Equipamento
                </Button>
                
                <Button
                  onClick={() => setViewMode('history')}
                  className="w-full h-20 text-lg"
                  variant="outline"
                >
                  <History className="w-8 h-8 mr-3" />
                  Histórico de Manutenções
                </Button>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};

export default FieldMaintenanceView;