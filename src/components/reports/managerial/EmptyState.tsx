
import React from 'react';
import { FileText } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="p-8 text-center">
      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado disponível</h3>
      <p className="text-gray-500">Ainda não há dados suficientes para gerar o relatório gerencial.</p>
    </div>
  );
};

export default EmptyState;
