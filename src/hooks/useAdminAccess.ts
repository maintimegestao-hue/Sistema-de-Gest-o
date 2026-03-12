import { useUserProfile } from './useUserProfile';

/**
 * Hook para verificar se o usuário atual é administrador da plataforma
 * Administradores têm acesso total a todos os recursos sem limitações
 */
export const useAdminAccess = () => {
  const { data: userProfile, isLoading } = useUserProfile();
  
  const isAdmin = userProfile?.role === 'admin';
  
  return {
    isAdmin,
    isLoading,
    // Métodos de conveniência
    canBypassLimits: () => isAdmin,
    canAccessAllFeatures: () => isAdmin,
    hasUnlimitedAccess: () => isAdmin,
  };
};

/**
 * Hook para verificar limites com bypass automático para admins
 */
export const useFeatureLimits = () => {
  const { isAdmin } = useAdminAccess();
  
  const checkLimit = (currentCount: number, maxLimit: number) => {
    // Admins sempre podem adicionar mais
    if (isAdmin) return true;
    
    // Para usuários normais, verificar limite
    return currentCount < maxLimit;
  };
  
  const getDisplayLimit = (maxLimit: number) => {
    // Admins veem "Ilimitado"
    if (isAdmin) return 'Ilimitado';
    
    // Usuários normais veem o limite real
    return maxLimit.toString();
  };
  
  return {
    checkLimit,
    getDisplayLimit,
    isAdmin,
  };
};