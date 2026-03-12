import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFieldAuth } from '@/hooks/useFieldAuth';
import { Wrench, QrCode } from 'lucide-react';

interface FieldLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FieldLoginModal: React.FC<FieldLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [accessCode, setAccessCode] = useState('');
  const { loginFieldTechnician, isLoading } = useFieldAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    const success = await loginFieldTechnician(accessCode.trim());
    if (success) {
      onSuccess();
      onClose();
      setAccessCode('');
    }
  };

  const handleClose = () => {
    setAccessCode('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            Acesso Técnico de Campo
          </DialogTitle>
        </DialogHeader>
        
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <QrCode className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-lg">Login de Campo</CardTitle>
            <p className="text-sm text-muted-foreground">
              Digite seu código de acesso para trabalhar em campo
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="accessCode">Código de Acesso</Label>
                <Input
                  id="accessCode"
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="TECH-XXXXXXXXXX"
                  className="font-mono uppercase"
                  autoComplete="off"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use o código fornecido pelo administrador
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !accessCode.trim()}
                  className="flex-1"
                >
                  {isLoading ? 'Verificando...' : 'Entrar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default FieldLoginModal;