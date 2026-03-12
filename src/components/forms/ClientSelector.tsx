
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSecureClients } from '@/hooks/useSecureClients';

interface ClientSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  required?: boolean;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
  value,
  onValueChange,
  required = false
}) => {
  const { data: clients, isLoading } = useSecureClients();

  return (
    <div className="space-y-2">
      <Label htmlFor="client">Cliente {required && '*'}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um cliente" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>Carregando...</SelectItem>
          ) : (
            clients?.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ClientSelector;
