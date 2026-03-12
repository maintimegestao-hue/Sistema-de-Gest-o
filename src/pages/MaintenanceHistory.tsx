import React from 'react';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MaintenanceHistoryView from '@/components/maintenance/MaintenanceHistoryView';

const MaintenanceHistory = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <MaintenanceHistoryView />
      </div>
    </DashboardLayout>
  );
};

export default MaintenanceHistory;