import React from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ClientPreventiveScheduleView from '@/components/preventive-schedule/ClientPreventiveScheduleView';

const ClientPreventiveSchedule = () => {
  const { clientId } = useParams();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <ClientPreventiveScheduleView clientId={clientId} />
      </div>
    </DashboardLayout>
  );
};

export default ClientPreventiveSchedule;