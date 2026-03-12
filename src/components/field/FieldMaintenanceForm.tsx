import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Camera } from 'lucide-react';
import { useCreateMaintenanceExecution } from '@/hooks/useCreateMaintenanceExecution';
import { useFieldAuth } from '@/hooks/useFieldAuth';
import { useToast } from '@/hooks/use-toast';

interface FieldMaintenanceFormProps {
  equipment: any;
  onBack: () => void;
}

const FieldMaintenanceForm: React.FC<FieldMaintenanceFormProps> = ({ equipment, onBack }) => {
  const [maintenanceType, setMaintenanceType] = useState<'preventive' | 'corrective'>('preventive');
  const [observations, setObservations] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const { fieldTechnician } = useFieldAuth();
  const createMaintenanceExecution = useCreateMaintenanceExecution();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!fieldTechnician) return;

    try {
      const maintenanceData = {
        equipment_id: equipment.id,
        maintenance_type: maintenanceType,
        technician_signature: fieldTechnician.name,
        observations: observations || `Manutenção ${maintenanceType === 'preventive' ? 'preventiva' : 'corretiva'} realizada em campo`,
        digital_signature: '', // Pode ser implementado futuramente
        checklist_items: [], // Pode ser expandido com checklist
        periodicity: maintenanceType === 'preventive' ? 'monthly' : undefined,
        maintenance_order_id: undefined,
        attachments: []
      };

      await createMaintenanceExecution.mutateAsync(maintenanceData);
      setIsCompleted(true);
      
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error) {
      console.error('Erro ao registrar manutenção:', error);
    }
  };

  if (isCompleted) {
    return (
      <Card className="text-center">
        <CardContent className="p-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-green-600 mb-2">
            Manutenção Registrada!
          </h3>
          <p className="text-muted-foreground">
            A manutenção do equipamento {equipment.name} foi registrada com sucesso.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold">Registrar Manutenção</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{equipment.name}</span>
            <Badge variant="outline">
              {equipment.installation_location || 'Local não informado'}
            </Badge>
          </CardTitle>
          {equipment.serial_number && (
            <p className="text-sm text-muted-foreground">
              Série: {equipment.serial_number}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">Tipo de Manutenção</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant={maintenanceType === 'preventive' ? 'default' : 'outline'}
                onClick={() => setMaintenanceType('preventive')}
                className="flex-1"
              >
                Preventiva
              </Button>
              <Button
                variant={maintenanceType === 'corrective' ? 'default' : 'outline'}
                onClick={() => setMaintenanceType('corrective')}
                className="flex-1"
              >
                Corretiva
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="technician">Técnico Responsável</Label>
            <Input
              id="technician"
              value={fieldTechnician?.name || ''}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="observations">Observações da Manutenção</Label>
            <Textarea
              id="observations"
              placeholder="Descreva os procedimentos realizados, peças trocadas, problemas encontrados, etc."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
            />
          </div>

          <div className="border-t pt-4">
            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={createMaintenanceExecution.isPending}
            >
              {createMaintenanceExecution.isPending ? 'Registrando...' : 'Registrar Manutenção'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldMaintenanceForm;