import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configurações padrão para evitar problemas de inicialização
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      // Evitar múltiplas requisições simultâneas
      networkMode: 'online',
      // Configurações de suspense
      suspense: false,
    },
    mutations: {
      // Configurações para mutações
      retry: 1,
      retryDelay: 1000,
      networkMode: 'online',
    },
  },
  // Configurações de logger para debug
  logger: {
    log: console.log,
    warn: console.warn,
    error: console.error,
  },
});

// Função para limpar queries específicas
export const clearQueries = (queryKey: string[]) => {
  queryClient.removeQueries({ queryKey });
};

// Função para invalidar queries específicas
export const invalidateQueries = (queryKey: string[]) => {
  queryClient.invalidateQueries({ queryKey });
};

// Função para resetar o estado do cliente
export const resetQueryClient = () => {
  queryClient.clear();
};


