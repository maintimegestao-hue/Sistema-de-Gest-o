
import { useLocation, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { menuItems } from "./SidebarMenuItems";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminAccess } from "@/hooks/useAdminAccess";

interface SidebarNavigationProps {
  onItemClick?: () => void;
}

const SidebarNavigation = ({ onItemClick }: SidebarNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useAdminAccess();

  const handleItemClick = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly) {
      return isAdmin;
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full px-3">
        <nav className="space-y-1 py-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start text-left h-10 px-3 ${
                  isActive 
                    ? "bg-evolutec-green text-white hover:bg-evolutec-green/90" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => handleItemClick(item.path)}
              >
                <Icon className="mr-3 h-4 w-4" />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
};

export default SidebarNavigation;
