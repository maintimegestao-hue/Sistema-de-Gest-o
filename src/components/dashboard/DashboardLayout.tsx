
import { ReactNode } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import TrialBanner from '../subscription/TrialBanner';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-secondary">
      <div className="flex">
        <DashboardSidebar />
        <div className="flex-1 min-w-0">
          <DashboardHeader />
          <main className="p-4 lg:p-6">
            <TrialBanner />
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
