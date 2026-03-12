
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OrderSelectionSectionProps {
  selectedOrder: string;
  onOrderChange: (value: string) => void;
  availableOrders: Array<{
    id: string;
    equipments?: { name: string };
    maintenance_type: string;
  }>;
}

const OrderSelectionSection: React.FC<OrderSelectionSectionProps> = ({
  selectedOrder,
  onOrderChange,
  availableOrders
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-evolutec-black mb-4">Selecionar O.S. (Opcional)</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="maintenance_order">Ordem de Serviço (Opcional)</Label>
          <Select value={selectedOrder} onValueChange={onOrderChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma O.S. pendente (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {availableOrders.map((order) => (
                <SelectItem key={order.id} value={order.id}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">O.S. #{order.id.slice(-6)}</span>
                    <span className="text-xs text-gray-500">
                      {order.equipments?.name} - {order.maintenance_type}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            * Este campo é opcional. Você pode executar manutenção sem uma O.S. específica.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSelectionSection;
