
import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorState: React.FC = () => {
  return (
    <div className="p-8 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dados</h3>
      <p className="text-gray-500">Não foi possível carregar os dados do relatório gerencial.</p>
    </div>
  );
};

export default ErrorState;
