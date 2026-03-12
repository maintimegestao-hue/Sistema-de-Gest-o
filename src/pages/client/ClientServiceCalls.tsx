import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useClientServiceCalls } from '@/hooks/useClientServiceCalls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, ArrowLeft, Clock, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const statusInfo: Record<string, { label: string; variant: any; icon: any }> = {
  open: { label: 'Aberto', variant: 'destructive', icon: AlertTriangle },
  in_progress: { label: 'Em Atendimento', variant: 'secondary', icon: Clock },
  resolved: { label: 'Resolvido', variant: 'default', icon: CheckCircle },
};

const ClientServiceCalls: React.FC = () => {
  const { clientData, isAuthenticated, initialized } = useClientAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessCode = localStorage.getItem('client_access_code') || undefined;
  
  const { data: calls = [], isLoading: loading } = useClientServiceCalls(
    clientData?.clientId, 
    accessCode
  );

  const closeServiceCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      const { error } = await supabase
        .from('service_calls')
        .update({ status: 'resolved', resolved_at: new Date().toISOString() })
        .eq('id', callId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-service-calls'] });
      queryClient.invalidateQueries({ queryKey: ['service-calls'] });
      toast.success('Chamado fechado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao fechar chamado');
      console.error('Erro:', error);
    }
  });

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      navigate('/client-login');
      return;
    }
  }, [initialized, isAuthenticated, navigate]);

  const isWithin24h = (dateStr: string) => Date.now() - new Date(dateStr).getTime() < 24*60*60*1000;

  if (!initialized || !clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/client-dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-red-100 rounded-lg p-2">
                  <Phone className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Meus Chamados</h1>
                  <p className="text-sm text-muted-foreground">{clientData.clientName}</p>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate('/client-service-call')}>Abrir novo chamado</Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Chamados de Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : calls.length === 0 ? (
              <div className="text-center py-12">
                <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Você ainda não abriu nenhum chamado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {calls.map((call) => {
                  const info = statusInfo[call.status] || statusInfo.open;
                  const Icon = info.icon;
                  return (
                     <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                       <div className="flex items-center gap-3">
                         <Icon className={`w-5 h-5 ${call.status==='open'?'text-orange-600':call.status==='resolved'?'text-green-600':'text-blue-600'}`} />
                         <div>
                           <div className="flex items-center gap-2">
                             <p className="font-medium text-sm">{call.call_number}</p>
                             {isWithin24h(call.created_at) && call.status !== 'resolved' && (
                               <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-semibold animate-pulse">NOVO</span>
                             )}
                             <Badge variant={info.variant} className="text-xs">{info.label}</Badge>
                           </div>
                           <p className="text-xs text-muted-foreground">
                             {call.equipments?.name} • {new Date(call.created_at).toLocaleString('pt-BR')}
                           </p>
                           {call.description && (
                             <p className="text-xs text-muted-foreground mt-1">
                               {call.description.substring(0, 100)}...
                             </p>
                           )}
                         </div>
                       </div>
                       <div className="flex items-center gap-2">
                         {call.status !== 'resolved' && (
                           <Button
                             variant="outline"
                             size="sm"
                             onClick={() => {
                               if (window.confirm('Tem certeza que deseja fechar este chamado?')) {
                                 closeServiceCallMutation.mutate(call.id);
                               }
                             }}
                             disabled={closeServiceCallMutation.isPending}
                             className="flex items-center gap-1"
                           >
                             <X className="w-3 h-3" />
                             Fechar
                           </Button>
                         )}
                       </div>
                     </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientServiceCalls;
