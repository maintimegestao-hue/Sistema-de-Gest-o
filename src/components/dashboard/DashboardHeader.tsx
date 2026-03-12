
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminBadge } from "./AdminBadge";

const DashboardHeader = () => {
  return (
    <div>
      <AdminBadge />
      <header className="bg-white shadow-sm border-b border-gray-200 p-4 lg:p-6">
        <div className="flex items-center justify-between gap-4">
        {/* Search - Hidden on mobile, visible on desktop */}
        <div className="hidden md:block relative flex-1 max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar equipamentos, O.S., técnicos..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
          />
        </div>

        {/* Mobile Search - Full width on mobile */}
        <div className="md:hidden relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          <Button variant="outline" size="sm" className="relative p-2 lg:px-3">
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
          </Button>
          
          {/* Last access info - Hidden on mobile */}
          <div className="hidden lg:block text-right">
            <div className="text-sm text-muted-foreground">Último acesso</div>
            <div className="text-xs text-muted-foreground">Hoje, 09:30</div>
          </div>
        </div>
        </div>
      </header>
    </div>
  );
};

export default DashboardHeader;
