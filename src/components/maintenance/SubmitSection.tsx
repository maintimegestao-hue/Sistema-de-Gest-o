
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface SubmitSectionProps {
  isPending: boolean;
  isFormValid: boolean;
  submitText?: string;
  validationDetails?: {
    hasSelectedOrder?: boolean;
    hasSelectedEquipment?: boolean;
    hasMaintenanceType?: boolean;
    hasTechnicianSignature?: boolean;
    isChecklistValid?: boolean;
    hasValidObservations?: boolean;
    hasDigitalSignature?: boolean;
  };
}

const SubmitSection: React.FC<SubmitSectionProps> = ({
  isPending,
  isFormValid,
  submitText = "Finalizar Manutenção",
  validationDetails
}) => {
  console.log('🔘 SubmitSection render - isFormValid:', isFormValid, 'isPending:', isPending);

  const getFieldLabel = (field: string) => {
    const labels: { [key: string]: string } = {
      hasSelectedOrder: 'Ordem de Serviço (opcional)',
      hasSelectedEquipment: 'Equipamento',
      hasMaintenanceType: 'Tipo de Manutenção',
      hasTechnicianSignature: 'Técnico Responsável',
      isChecklistValid: 'Checklist',
      hasValidObservations: 'Observações (mín. 3 caracteres)',
      hasDigitalSignature: 'Assinatura Digital'
    };
    return labels[field] || field;
  };

  // Apenas campos obrigatórios são mostrados como faltando
  const missingFields = validationDetails ? 
    Object.entries(validationDetails)
      .filter(([field, isValid]) => !isValid && field !== 'hasSelectedOrder') // Excluir O.S. da lista de obrigatórios
      .map(([field]) => getFieldLabel(field))
    : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {!isFormValid && (
        <div className="mb-4 space-y-3">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
            <AlertCircle size={16} className="text-yellow-600 mr-2 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-700 font-medium mb-2">
                Campos obrigatórios não preenchidos:
              </p>
              {missingFields.length > 0 && (
                <ul className="space-y-1">
                  {missingFields.map((field, index) => (
                    <li key={index} className="text-sm text-yellow-700 flex items-center">
                      <X size={12} className="mr-2 text-red-500" />
                      {field}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-yellow-600 mt-2">
                * O campo "Ordem de Serviço" é opcional
              </p>
            </div>
          </div>
        </div>
      )}

      {isFormValid && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle size={16} className="text-green-600 mr-2" />
          <p className="text-sm text-green-700">
            ✅ Todos os campos obrigatórios estão preenchidos!
          </p>
        </div>
      )}
      
      <Button
        type="submit"
        disabled={isPending || !isFormValid}
        className={`w-full ${isFormValid ? 'evolutec-btn' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
      >
        {isPending ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processando...
          </>
        ) : (
          <>
            <CheckCircle size={16} className="mr-2" />
            {submitText}
          </>
        )}
      </Button>
    </div>
  );
};

export default SubmitSection;
