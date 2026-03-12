import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Clock, User, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';
import { useServiceCalls } from '@/hooks/useServiceCalls';
import { useUserProfile } from '@/hooks/useUserProfile';

const DashboardServiceCalls = () => {
  const navigate = useNavigate();
  const { data: userProfile } = useUserProfile();
  const { data: serviceCalls, isLoading } = useServiceCalls(userProfile?.user_id);

  // Filtrar chamados recentes (últimos 5) - excluir os resolvidos
  const recentCalls = (serviceCalls || [])
    .filter(call => call.status !== 'resolved')
    .slice(0, 5);

  const isWithin24h = (dateStr: string) => {
    const created = new Date(dateStr).getTime();
    return Date.now() - created < 24 * 60 * 60 * 1000;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Phone className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberto';
      case 'in_progress':
        return 'Em Atendimento';
      case 'resolved':
        return 'Resolvido';
      default:
        return 'Aguardando';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'in_progress':
        return 'secondary';
      case 'resolved':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Chamados Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Chamados Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentCalls.length === 0 ? (
          <div className="text-center py-8">
            <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum chamado encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentCalls.map((call: any) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(call.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{call.call_number}</p>
                      {isWithin24h(call.created_at) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-semibold animate-pulse">
                          ALERTA
                        </span>
                      )}
                      <Badge variant={getStatusVariant(call.status)} className="text-xs">
                        {getStatusLabel(call.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{call.equipments?.name || call.equipments?.[0]?.name}</span>
                      <span>•</span>
                      <span>{call.clients?.name || call.clients?.[0]?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(call.created_at).toLocaleDateString('pt-BR')}</span>
                      <span className={`font-medium ${getPriorityColor(call.priority)}`}>
                        • {call.priority === 'high' ? 'Alta' : call.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {recentCalls.length >= 5 && (
              <div className="pt-3 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/service-calls')}
                >
                  Ver todos os chamados
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardServiceCalls;