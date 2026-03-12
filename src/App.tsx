
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { Toaster } from '@/components/ui/sonner';
import Index from './pages/Index';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './pages/Dashboard';
import Equipments from './pages/Equipments';
import Maintenance from './pages/Maintenance';
import ExecuteMaintenance from './pages/ExecuteMaintenance';
import PreventiveSchedule from './pages/PreventiveSchedule';
import Reports from './pages/Reports';
import Technicians from './pages/Technicians';
import Clients from './pages/Clients';
import ClientComparison from './pages/ClientComparison';
import ServiceProposals from './pages/ServiceProposals';
import ProposalPipeline from './pages/ProposalPipeline';
import MaterialsAndServices from './pages/MaterialsAndServices';
import Subscription from './pages/Subscription';
import ProfileSettings from './pages/ProfileSettings';
import CompanySettings from './pages/CompanySettings';
import SystemSettings from './pages/SystemSettings';
import PublicMaintenance from './pages/PublicMaintenance';
import NotFound from './pages/NotFound';
import Materials from '@/pages/Materials';
import Services from '@/pages/Services';
import Suppliers from '@/pages/Suppliers';
import FieldTechnicians from '@/pages/FieldTechnicians';
import FieldAccess from '@/pages/FieldAccess';
import FieldLogin from '@/pages/FieldLogin';
import MaintenanceHistory from '@/pages/MaintenanceHistory';
import ClientPreventiveSchedule from '@/pages/ClientPreventiveSchedule';
import ClientLogin from '@/pages/ClientLogin';
import ClientDashboard from '@/pages/ClientDashboard';
import ClientReports from '@/pages/ClientReports';
import ClientAccessManagementPage from '@/pages/ClientAccessManagement';
import ClientEquipmentMaintenance from '@/pages/client/ClientEquipmentMaintenance';
import ClientMaintenanceHistory from '@/pages/client/ClientMaintenanceHistory';
import ClientTechnicalReports from '@/pages/client/ClientTechnicalReports';
import ClientServiceCall from '@/pages/client/ClientServiceCall';
import ClientServiceCallEquipmentList from '@/pages/client/ClientServiceCallEquipmentList';
import ClientServiceCallQRScanner from '@/pages/client/ClientServiceCallQRScanner';
import ClientServiceCallForm from '@/pages/client/ClientServiceCallForm';
import ClientServiceCallSuccess from '@/pages/client/ClientServiceCallSuccess';
import ClientServiceCalls from '@/pages/client/ClientServiceCalls';
import ServiceCalls from '@/pages/ServiceCalls';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/index" element={<Index />} />
            <Route path="/auth" element={<LoginPage />} />
            <Route path="/field" element={<FieldLogin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/equipments" element={<Equipments />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/execute-maintenance" element={<ExecuteMaintenance />} />
            <Route path="/preventive-schedule" element={<PreventiveSchedule />} />
            <Route path="/maintenance-history" element={<MaintenanceHistory />} />
            <Route path="/client-preventive-schedule/:clientId" element={<ClientPreventiveSchedule />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/services" element={<Services />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/technicians" element={<Technicians />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/client-comparison" element={<ClientComparison />} />
          <Route path="/service-proposals" element={<ServiceProposals />} />
          <Route path="/proposal-pipeline" element={<ProposalPipeline />} />
            <Route path="/service-calls" element={<ServiceCalls />} />
            <Route path="/materials-and-services" element={<MaterialsAndServices />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            <Route path="/company-settings" element={<CompanySettings />} />
            <Route path="/system-settings" element={<SystemSettings />} />
            <Route path="/field-technicians" element={<FieldTechnicians />} />
            <Route path="/field-access" element={<FieldAccess />} />
            <Route path="/client-login" element={<ClientLogin />} />
            <Route path="/client-dashboard" element={<ClientDashboard />} />
            <Route path="/client-reports" element={<ClientReports />} />
            <Route path="/client-equipment-maintenance" element={<ClientEquipmentMaintenance />} />
            <Route path="/client-maintenance-history" element={<ClientMaintenanceHistory />} />
            <Route path="/client-technical-reports" element={<ClientTechnicalReports />} />
            <Route path="/client-service-call" element={<ClientServiceCall />} />
            <Route path="/client-service-call/equipment-list" element={<ClientServiceCallEquipmentList />} />
            <Route path="/client-service-call/qr-scanner" element={<ClientServiceCallQRScanner />} />
            <Route path="/client-service-call/form/:equipmentId" element={<ClientServiceCallForm />} />
            <Route path="/client-service-call/success" element={<ClientServiceCallSuccess />} />
            <Route path="/client-service-calls" element={<ClientServiceCalls />} />
            <Route path="/client-access-management" element={<ClientAccessManagementPage />} />
            <Route path="/public-maintenance/:equipmentId" element={<PublicMaintenance />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
