import React from 'react';
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FieldAccessButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/field')}
      variant="outline"
      className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 font-medium"
    >
      <Wrench className="w-4 h-4" />
      Acesso Técnico
    </Button>
  );
};

export default FieldAccessButton;