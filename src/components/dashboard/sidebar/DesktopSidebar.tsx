
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormModal from "@/components/modals/FormModal";
import NewMaintenanceOrderForm from "@/components/forms/NewMaintenanceOrderForm";
import NewServiceProposalForm from "@/components/forms/NewServiceProposalForm";
import SidebarLogo from "./SidebarLogo";
import SidebarQuickActions from "./SidebarQuickActions";
import SidebarNavigation from "./SidebarNavigation";
import SidebarUserProfile from "./SidebarUserProfile";

const DesktopSidebar = () => {
  const navigate = useNavigate();
  const [isNewOSModalOpen, setIsNewOSModalOpen] = useState(false);
  const [isNewProposalModalOpen, setIsNewProposalModalOpen] = useState(false);

  const handleNewOSSuccess = () => {
    setIsNewOSModalOpen(false);
    navigate('/maintenance');
  };

  const handleNewProposalSuccess = () => {
    setIsNewProposalModalOpen(false);
    navigate('/service-proposals');
  };

  return (
    <>
      <div className="w-64 bg-white shadow-lg h-screen sticky top-0 flex flex-col">
        <div className="p-6 flex-shrink-0">
          <SidebarLogo className="mb-8" />
          
          <SidebarQuickActions 
            onNewOSClick={() => setIsNewOSModalOpen(true)}
            onNewProposalClick={() => setIsNewProposalModalOpen(true)}
            className="mb-6"
          />
        </div>

        <SidebarNavigation />
        
        <SidebarUserProfile />
      </div>

      <FormModal
        isOpen={isNewOSModalOpen}
        onClose={() => setIsNewOSModalOpen(false)}
        title="Nova Ordem de Serviço"
      >
        <NewMaintenanceOrderForm onSuccess={handleNewOSSuccess} />
      </FormModal>

      <FormModal
        isOpen={isNewProposalModalOpen}
        onClose={() => setIsNewProposalModalOpen(false)}
        title="Nova Proposta de Serviço"
      >
        <NewServiceProposalForm onSuccess={handleNewProposalSuccess} />
      </FormModal>
    </>
  );
};

export default DesktopSidebar;
