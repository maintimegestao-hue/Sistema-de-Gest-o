
import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="p-8 text-center">
      <div className="animate-spin w-8 h-8 border-2 border-evolutec-green border-t-transparent rounded-full mx-auto mb-4"></div>
      <p>Carregando relatório gerencial...</p>
    </div>
  );
};

export default LoadingState;
