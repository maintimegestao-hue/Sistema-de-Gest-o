import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateFieldTechnician } from '@/hooks/useFieldTechnicians';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  name: string;
  email: string;
  phone?: string;
}

interface NewFieldTechnicianFormProps {
  onSuccess?: () => void;
}

const NewFieldTechnicianForm: React.FC<NewFieldTechnicianFormProps> = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  const createFieldTechnician = useCreateFieldTechnician();
  const [createdTechnician, setCreatedTechnician] = useState<any>(null);
  const [showAccessCode, setShowAccessCode] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: FormData) => {
    console.log('📋 Formulário submetido com dados:', data);
    try {
      const result = await createFieldTechnician.mutateAsync(data);
      console.log('🎉 Resultado da criação:', result);
      setCreatedTechnician(result);
      reset();
    } catch (error) {
      console.error('❌ Erro ao criar técnico:', error);
    }
  };

  const copyAccessCode = () => {
    if (createdTechnician?.access_code) {
      navigator.clipboard.writeText(createdTechnician.access_code);
      toast({
        title: 'Copiado!',
        description: 'Código de acesso copiado para a área de transferência.',
      });
    }
  };

  const handleNewTechnician = () => {
    setCreatedTechnician(null);
    onSuccess?.();
  };

  if (createdTechnician) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-green-600">
            Técnico Criado com Sucesso!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Nome:</Label>
            <p className="text-lg">{createdTechnician.name}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Email:</Label>
            <p className="text-lg">{createdTechnician.email}</p>
          </div>
          
          <div className="border-t pt-4">
            <Label className="text-sm font-medium text-red-600">
              Código de Acesso (compartilhe com segurança):
            </Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type={showAccessCode ? "text" : "password"}
                value={createdTechnician.access_code}
                readOnly
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowAccessCode(!showAccessCode)}
              >
                {showAccessCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyAccessCode}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Guarde este código com segurança. O técnico usará para acessar o sistema.
            </p>
          </div>
          
          <Button onClick={handleNewTechnician} className="w-full">
            Criar Outro Técnico
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Novo Técnico de Campo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Nome é obrigatório' })}
              placeholder="Nome completo do técnico"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email', { 
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
              placeholder="email@exemplo.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="(11) 99999-9999"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createFieldTechnician.isPending}
          >
            {createFieldTechnician.isPending ? 'Criando...' : 'Criar Técnico'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewFieldTechnicianForm;