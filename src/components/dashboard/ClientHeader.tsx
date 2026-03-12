import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Building2, LogOut } from 'lucide-react';
import { useClientContext } from '@/contexts/ClientContext';

const ClientHeader: React.FC = () => {
  const { selectedClientName, clearSelectedClient } = useClientContext();

  const handleChangeClient = () => {
    clearSelectedClient();
  };

  return (
    <Card className="mb-6 bg-primary/5 border-primary/20">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cliente Selecionado:</p>
            <h2 className="text-lg font-semibold text-foreground">
              {selectedClientName}
            </h2>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleChangeClient}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Trocar Cliente
        </Button>
      </div>
    </Card>
  );
};

export default ClientHeader;