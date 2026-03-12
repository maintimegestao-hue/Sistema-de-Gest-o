
import React from 'react';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MaintenanceHeader from '@/components/maintenance/MaintenanceHeader';
import ExecuteMaintenanceForm from '@/components/maintenance/ExecuteMaintenanceForm';
import QRScannerHandler from '@/components/maintenance/QRScannerHandler';
import { useExecuteMaintenanceForm } from '@/hooks/useExecuteMaintenanceForm';

const ExecuteMaintenance = () => {
  const {
    showQRScanner,
    setShowQRScanner,
    completedItems,
    totalItems,
    selectedEquipmentData,
    selectedOrderData,
    handleQRCodeDetected,
  } = useExecuteMaintenanceForm();

  console.log('🔄 Renderização do ExecuteMaintenance');

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <MaintenanceHeader 
          selectedEquipmentName={selectedEquipmentData?.name}
          completedItems={completedItems}
          totalItems={totalItems}
          orderNumber={selectedOrderData ? `#${selectedOrderData.id.slice(-6)}` : undefined}
        />

        <ExecuteMaintenanceForm />

        <QRScannerHandler
          showQRScanner={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onQRCodeDetected={handleQRCodeDetected}
        />
      </div>
    </DashboardLayout>
  );
};

export default ExecuteMaintenance;
