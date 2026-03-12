import React from 'react';
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const ClientAccessButton = () => {
  const navigate = useNavigate();

  return (
    <Button 
      variant="outline" 
      onClick={() => navigate('/client-login')}
      className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
    >
      <Building2 className="w-4 h-4 mr-2" />
      Portal do Cliente
    </Button>
  );
};

export default ClientAccessButton;