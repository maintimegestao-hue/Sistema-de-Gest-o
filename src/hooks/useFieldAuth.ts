import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FieldTechnicianData {
  technician_id: string;
  name: string;
  email: string;
  is_active: boolean;
}

export const useFieldAuth = () => {
  const [fieldTechnician, setFieldTechnician] = useState<FieldTechnicianData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();

  // Verificar se há sessão ativa ao carregar
  useEffect(() => {
    const savedSession = localStorage.getItem('field_session');
    console.log('🔍 Verificando sessão salva:', savedSession);
    
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        console.log('✅ Dados da sessão recuperados:', sessionData);
        setFieldTechnician(sessionData);
      } catch (error) {
        console.error('❌ Erro ao recuperar sessão:', error);
        localStorage.removeItem('field_session');
      }
    } else {
      console.log('ℹ️ Nenhuma sessão encontrada no localStorage');
    }
    
    // Marca que a inicialização terminou
    setIsInitializing(false);
    console.log('🚀 Inicialização do useFieldAuth concluída');
  }, []);

  const loginFieldTechnician = async (accessCode: string) => {
    setIsLoading(true);
    try {
      console.log('🔍 Iniciando login para técnico com código:', accessCode);
      
      // Usar a função segura para autenticação
      const { data: technicians, error: techError } = await supabase
        .rpc('authenticate_field_technician', { input_access_code: accessCode });

      console.log('🔍 Resultado da autenticação:', { 
        technicians, 
        techError, 
        accessCode,
        count: technicians?.length
      });

      if (techError) {
        console.error('❌ Erro na busca:', techError);
        throw new Error('Erro ao verificar código de acesso');
      }
      
      if (!technicians || technicians.length === 0) {
        console.log('❌ Nenhum técnico encontrado para o código');
        throw new Error('Código de acesso inválido ou técnico inativo');
      }

      const technician = technicians[0];
      console.log('✅ Técnico encontrado:', technician);

      // Criar sessão simples no localStorage
      const sessionData = {
        technician_id: technician.technician_id,
        name: technician.name,
        email: technician.email,
        is_active: technician.is_active,
        access_code: accessCode,
        login_time: new Date().toISOString()
      };

      console.log('💾 Salvando dados da sessão:', sessionData);
      localStorage.setItem('field_session', JSON.stringify(sessionData));
      setFieldTechnician(sessionData);

      console.log('✅ Login realizado com sucesso, retornando true');

      toast({
        title: 'Login realizado!',
        description: `Bem-vindo, ${technician.name}!`,
      });

      return true;
    } catch (error: any) {
      console.error('❌ Erro completo no login:', error);
      toast({
        title: 'Erro no login',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      console.log('🔄 Finalizando processo de login');
      setIsLoading(false);
    }
  };

  const logoutFieldTechnician = () => {
    localStorage.removeItem('field_session');
    setFieldTechnician(null);
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  };

  const isAuthenticated = !!fieldTechnician;

  return {
    fieldTechnician,
    isAuthenticated,
    isLoading,
    isInitializing,
    loginFieldTechnician,
    logoutFieldTechnician,
  };
};