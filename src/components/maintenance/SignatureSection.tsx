
import React from 'react';
import ObservationsField from './ObservationsField';

interface SignatureSectionProps {
  observations: string;
  setObservations: (value: string) => void;
  technicianSignature: string;
  setTechnicianSignature: (value: string) => void;
}

const SignatureSection: React.FC<SignatureSectionProps> = ({
  observations,
  setObservations,
  technicianSignature,
  setTechnicianSignature
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-evolutec-black mb-4">
        Observações e Identificação
      </h3>
      
      <div className="space-y-4">
        <ObservationsField 
          value={observations}
          onChange={setObservations}
        />

        <div>
          <label className="block text-sm font-medium text-evolutec-black mb-2">
            Nome do Técnico Responsável *
          </label>
          <input
            type="text"
            value={technicianSignature}
            onChange={(e) => setTechnicianSignature(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-evolutec-green focus:border-transparent"
            placeholder="Digite seu nome completo"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default SignatureSection;
