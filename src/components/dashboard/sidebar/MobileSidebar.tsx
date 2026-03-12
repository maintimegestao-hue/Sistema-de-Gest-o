
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import FormModal from "@/components/modals/FormModal";
import NewMaintenanceOrderForm from "@/components/forms/NewMaintenanceOrderForm";
import NewServiceProposalForm from "@/components/forms/NewServiceProposalForm";
import SidebarLogo from "./SidebarLogo";
import SidebarQuickActions from "./SidebarQuickActions";
import SidebarNavigation from "./SidebarNavigation";
import SidebarUserProfile from "./SidebarUserProfile";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const navigate = useNavigate();
  const [isNewOSModalOpen, setIsNewOSModalOpen] = useState(false);
  const [isNewProposalModalOpen, setIsNewProposalModalOpen] = useState(false);

  const handleNewOSSuccess = () => {
    setIsNewOSModalOpen(false);
    navigate('/maintenance');
    onClose();
  };

  const handleNewProposalSuccess = () => {
    setIsNewProposalModalOpen(false);
    navigate('/service-proposals');
    onClose();
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 flex-shrink-0 border-b">
              <div className="flex items-center justify-between mb-6">
                <SidebarLogo />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X size={16} />
                </Button>
              </div>

              <SidebarQuickActions 
                onNewOSClick={() => setIsNewOSModalOpen(true)}
                onNewProposalClick={() => setIsNewProposalModalOpen(true)}
              />
            </div>

            {/* Navigation */}
            <SidebarNavigation onItemClick={onClose} />

            {/* Bottom Section */}
            <SidebarUserProfile />
          </div>
        </SheetContent>
      </Sheet>

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

export default MobileSidebar;
