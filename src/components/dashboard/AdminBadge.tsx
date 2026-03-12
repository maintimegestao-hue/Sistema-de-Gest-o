import React from 'react';
import { Crown, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAdminAccess } from '@/hooks/useAdminAccess';

export const AdminBadge = () => {
  const { isAdmin } = useAdminAccess();

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mb-4">
      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center gap-2 px-3 py-1">
        <Crown size={16} />
        <Shield size={16} />
        Administrador da Plataforma
      </Badge>
      <div className="text-sm text-muted-foreground">
        🚀 Você tem acesso total a todos os recursos sem limitações
      </div>
    </div>
  );
};