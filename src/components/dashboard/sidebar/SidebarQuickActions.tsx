
import { Plus, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarQuickActionsProps {
  onNewOSClick: () => void;
  onNewProposalClick: () => void;
  className?: string;
}

const SidebarQuickActions = ({ 
  onNewOSClick, 
  onNewProposalClick, 
  className = "" 
}: SidebarQuickActionsProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <Button 
        className="maintex-btn w-full"
        onClick={onNewOSClick}
      >
        <Plus size={16} className="mr-2" />
        Nova O.S.
      </Button>
      <Button 
        className="maintex-btn w-full"
        onClick={onNewProposalClick}
      >
        <FileCheck size={16} className="mr-2" />
        Nova Proposta
      </Button>
    </div>
  );
};

export default SidebarQuickActions;
