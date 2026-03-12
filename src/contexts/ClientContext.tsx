import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ClientContextType {
  selectedClientId: string | null;
  selectedClientName: string | null;
  isAllClients: boolean;
  setSelectedClient: (clientId: string | null, clientName: string | null) => void;
  setAllClients: () => void;
  clearSelectedClient: () => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClientContext = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClientContext must be used within a ClientProvider');
  }
  return context;
};

interface ClientProviderProps {
  children: ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);
  const [isAllClients, setIsAllClients] = useState<boolean>(false);

  const setSelectedClient = (clientId: string | null, clientName: string | null) => {
    setSelectedClientId(clientId);
    setSelectedClientName(clientName);
    setIsAllClients(false);
  };

  const setAllClients = () => {
    setSelectedClientId(null);
    setSelectedClientName("Todos os Clientes");
    setIsAllClients(true);
  };

  const clearSelectedClient = () => {
    setSelectedClientId(null);
    setSelectedClientName(null);
    setIsAllClients(false);
  };

  return (
    <ClientContext.Provider
      value={{
        selectedClientId,
        selectedClientName,
        isAllClients,
        setSelectedClient,
        setAllClients,
        clearSelectedClient,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};