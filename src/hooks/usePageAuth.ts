
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export const usePageAuth = () => {
  const { user, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('🏠 usePageAuth hook called');
    console.log('👤 User data:', { id: user?.id, email: user?.email });
    console.log('⏳ Loading state:', loading);
    
    // Aguarda um ciclo completo antes de marcar como pronto
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [user, loading]);

  // Só retorna loading=true se realmente não há dados e está carregando
  const shouldShowLoading = loading && !user && !isReady;
  
  return { 
    user, 
    loading: shouldShowLoading
  };
};
