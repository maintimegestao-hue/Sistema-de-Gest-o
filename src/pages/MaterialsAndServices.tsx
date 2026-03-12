
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { usePageAuth } from "@/hooks/usePageAuth";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import AccessDenied from "@/components/common/AccessDenied";
import MaterialsServicesHeader from "@/components/materials/MaterialsServicesHeader";
import MaterialsServicesTabs from "@/components/materials/MaterialsServicesTabs";

const MaterialsAndServices = () => {
  console.log('🏠 MaterialsAndServices page rendering');
  
  const { user, loading } = usePageAuth();

  console.log('👤 MaterialsAndServices - User:', user?.id, 'Loading:', loading);

  // Show loading only when actually loading and no user yet
  if (loading) {
    console.log('⏳ MaterialsAndServices - Showing loading state');
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  // Show access denied only when not loading and no user
  if (!loading && !user) {
    console.log('❌ MaterialsAndServices - User not authenticated');
    return (
      <DashboardLayout>
        <AccessDenied />
      </DashboardLayout>
    );
  }

  console.log('✅ MaterialsAndServices - Rendering page content for user:', user.id);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <MaterialsServicesHeader />
        <MaterialsServicesTabs />
      </div>
    </DashboardLayout>
  );
};

export default MaterialsAndServices;
