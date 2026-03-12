import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClientData {
  clientAccessId: string;
  clientId: string;
  clientName: string;
  permissions: {
    preventive_schedule?: boolean;
    managerial_reports?: boolean;
    equipment_maintenance?: boolean;
    maintenance_history?: boolean;
    technical_reports?: boolean;
  };
}

export const useClientAuth = () => {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  const loginClient = async (accessCode: string): Promise<boolean> => {
    console.log('🔑 Tentando login do cliente com código:', accessCode);
    setIsLoading(true);

    try {
      // Primeiro, vamos verificar se o código existe na tabela
      console.log('🔍 Verificando código na tabela client_access...');
      const { data: accessCheck, error: checkError } = await supabase
        .from('client_access')
        .select('*')
        .eq('access_code', accessCode)
        .eq('is_active', true);

      console.log('📊 Resultado da verificação:', { accessCheck, checkError });

      if (checkError) {
        console.error('❌ Erro na verificação direta:', checkError);
      }

      // Autenticar cliente usando a função RPC
      console.log('🔑 Chamando função authenticate_client...');
      const { data: authData, error: authError } = await supabase
        .rpc('authenticate_client', { input_access_code: accessCode });

      console.log('📊 Resultado da autenticação RPC:', { authData, authError });

      if (authError) {
        console.error('❌ Erro na autenticação:', authError);
        toast({
          title: 'Erro de autenticação',
          description: `Código de acesso inválido ou expirado. Erro: ${authError.message}`,
          variant: 'destructive',
        });
        return false;
      }

      // Selecionar dados do cliente a partir do melhor disponível (RPC ou fallback direto)
      let clientInfo: any = null;
      if (authData && authData.length > 0) {
        clientInfo = authData[0];
      } else if (accessCheck && accessCheck.length > 0) {
        console.log('ℹ️ RPC não retornou linhas, usando fallback via client_access');
        const accessRow: any = accessCheck[0];
        let clientNameFallback = 'Cliente';
        if (accessRow.client_id) {
          const { data: clientRow } = await supabase
            .from('clients')
            .select('name')
            .eq('id', accessRow.client_id as string)
            .maybeSingle();
          clientNameFallback = clientRow?.name || clientNameFallback;
        }
        clientInfo = {
          client_access_id: accessRow.id,
          client_id: accessRow.client_id,
          client_name: clientNameFallback,
          permissions: accessRow.permissions || {},
        };
      } else {
        console.log('❌ Nenhum cliente encontrado para o código:', accessCode);
        toast({
          title: 'Acesso negado',
          description: 'Código de acesso não encontrado ou inativo.',
          variant: 'destructive',
        });
        return false;
      }

      console.log('✅ Cliente autenticado:', clientInfo);

      // Iniciar sessão
      const { data: sessionId, error: sessionError } = await supabase
        .rpc('start_client_session', { input_access_code: accessCode });

      if (sessionError) {
        console.error('❌ Erro ao criar sessão:', sessionError);
        toast({
          title: 'Erro de sessão',
          description: 'Não foi possível iniciar a sessão.',
          variant: 'destructive',
        });
        return false;
      }

      // Salvar dados do cliente no estado
      console.log('🔍 Processando dados do cliente:', clientInfo);
      
      // A função RPC retorna uma estrutura diferente, vamos adaptar
      let clientAccessId, clientId, clientName, permissions;
      
      if (typeof clientInfo === 'object' && clientInfo.client_access_id) {
        // Formato esperado do clientInfo
        clientAccessId = clientInfo.client_access_id;
        clientId = clientInfo.client_id;
        clientName = clientInfo.client_name;
        permissions = clientInfo.permissions;
      } else if (Array.isArray(clientInfo) && clientInfo.length >= 5) {
        // Formato de array retornado pela função RPC
        clientAccessId = clientInfo[0];
        clientId = clientInfo[1];
        clientName = clientInfo[2];
        permissions = typeof clientInfo[3] === 'string' ? JSON.parse(clientInfo[3]) : clientInfo[3];
      } else {
        console.error('❌ Formato de dados inesperado:', clientInfo);
        throw new Error('Formato de dados inválido retornado pela autenticação');
      }

      const clientData: ClientData = {
        clientAccessId,
        clientId,
        clientName,
        permissions: permissions || {},
      };

      console.log('💾 Dados do cliente processados:', clientData);

      setClientData(clientData);
      
      // Salvar no localStorage para persistência
      localStorage.setItem('clientData', JSON.stringify(clientData));
      localStorage.setItem('clientAccessCode', accessCode);
      localStorage.setItem('client_access_code', accessCode);

      console.log('✅ Login bem-sucedido');
      toast({
        title: 'Acesso autorizado',
        description: `Bem-vindo, ${clientName}!`,
      });

      return true;

    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast({
        title: 'Erro inesperado',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutClient = () => {
    setClientData(null);
    localStorage.removeItem('clientData');
    localStorage.removeItem('clientAccessCode');
    localStorage.removeItem('client_access_code');
    console.log('👋 Cliente deslogado');
  };

  // Verificar se há dados salvos ao inicializar
  useEffect(() => {
    const savedClientData = localStorage.getItem('clientData');
    if (savedClientData) {
      try {
        const parsed = JSON.parse(savedClientData);
        setClientData(parsed);
        console.log('📱 Dados do cliente restaurados:', parsed);
      } catch (error) {
        console.error('❌ Erro ao restaurar dados do cliente:', error);
        localStorage.removeItem('clientData');
        localStorage.removeItem('clientAccessCode');
      }
    }
    setInitialized(true);
  }, []);

  return {
    clientData,
    isLoading,
    loginClient,
    logoutClient,
    isAuthenticated: !!clientData,
    initialized,
  };
};