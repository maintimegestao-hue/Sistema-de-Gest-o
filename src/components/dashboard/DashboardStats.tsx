
import { 
  Settings, 
  Calendar, 
  User, 
  Check, 
  Crown, 
  Database, 
  AlertTriangle, 
  Wrench, 
  Activity, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Pause
} from "lucide-react";
import { useClientDashboardStats } from "@/hooks/useClientDashboardStats";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useClientContext } from "@/contexts/ClientContext";

const DashboardStats = () => {
  const { selectedClientId, selectedClientName, isAllClients } = useClientContext();
  const { isAdmin } = useAdminAccess();
  const { data: adminStats } = useAdminDashboard();
  const stats = useClientDashboardStats();

  // Principais indicadores de equipamentos e manutenção
  const mainStats = [
    {
      icon: Database,
      label: "Total de Equipamentos",
      value: stats.totalEquipments.toString(),
      subtitle: `${stats.activeEquipments} ativos`,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: Settings,
      label: "Equipamentos Ativos",
      value: stats.activeEquipments.toString(),
      subtitle: `${((stats.activeEquipments / (stats.totalEquipments || 1)) * 100).toFixed(1)}% do total`,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      icon: AlertTriangle,
      label: "Aguardando Corretiva",
      value: stats.awaitingCorrectiveMaintenance.toString(),
      subtitle: "equipamentos em fila",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      icon: Calendar,
      label: "Manutenções Hoje",
      value: (stats.todayCorrectiveMaintenance + stats.todayPreventiveMaintenance).toString(),
      subtitle: `${stats.todayPreventiveMaintenance} preventivas, ${stats.todayCorrectiveMaintenance} corretivas`,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    }
  ];

  // Indicadores mensais
  const monthlyStats = [
    {
      icon: Wrench,
      label: "Preventivas do Mês",
      value: stats.monthlyPreventiveMaintenance.toString(),
      subtitle: "executadas",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600"
    },
    {
      icon: Activity,
      label: "Corretivas do Mês",
      value: stats.monthlyCorrectiveMaintenance.toString(),
      subtitle: "executadas",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600"
    }
  ];

  // Percentuais de status
  const statusStats = [
    {
      icon: CheckCircle,
      label: "Executadas",
      value: `${stats.executedPercentage.toFixed(1)}%`,
      subtitle: "concluídas",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600"
    },
    {
      icon: Clock,
      label: "Pendentes",
      value: `${stats.pendingPercentage.toFixed(1)}%`,
      subtitle: "aguardando",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600"
    },
    {
      icon: XCircle,
      label: "Atrasadas",
      value: `${stats.overduePercentage.toFixed(1)}%`,
      subtitle: "em atraso",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600"
    },
    {
      icon: Pause,
      label: "Em Andamento",
      value: `${stats.waitingPercentage.toFixed(1)}%`,
      subtitle: "executando",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    }
  ];

  // 🚀 Estatísticas especiais para administradores
  const adminSpecialStats = isAdmin && adminStats ? [
    {
      icon: Crown,
      label: "Total de Usuários",
      value: adminStats.totalUsers.toString(),
      subtitle: "na plataforma",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      isAdmin: true
    }
  ] : [];

  // Se nenhum cliente selecionado, mostrar mensagem
  if (!selectedClientId && !isAllClients) {
    return (
      <div className="text-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border">
        <Database className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-600 mb-2">
          Selecione um cliente para ver os indicadores
        </h3>
        <p className="text-slate-500">
          Os dados do dashboard serão exibidos após a seleção de um cliente
        </p>
      </div>
    );
  }

  const renderStatCard = (stat: any, index: number) => (
    <div key={index} className="group relative overflow-hidden bg-white rounded-xl border border-slate-200/60 hover:border-slate-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
            <stat.icon size={24} className={stat.iconColor} />
          </div>
          {stat.isAdmin && (
            <Crown size={16} className="text-yellow-500" />
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-600 group-hover:text-slate-700">
            {stat.label}
          </p>
          <p className="text-3xl font-bold text-slate-900 group-hover:text-slate-800">
            {stat.value}
          </p>
          <p className="text-sm text-slate-500">
            {stat.subtitle}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header com informações do cliente */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-xl border border-primary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Indicadores de Desempenho
            </h2>
            <p className="text-muted-foreground">
              {selectedClientName} - Métricas em tempo real
            </p>
          </div>
        </div>
      </div>

      {/* Admin Banner */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="text-yellow-600" size={16} />
            <span className="font-semibold text-yellow-800">Vista de Administrador</span>
          </div>
          <p className="text-sm text-yellow-700">
            {isAllClients ? 'Visualizando dados agregados de todos os clientes' : 'Acesso administrativo ativo'}
          </p>
        </div>
      )}

      {/* Estatísticas Principais */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Equipamentos e Manutenção
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...adminSpecialStats, ...mainStats].map(renderStatCard)}
        </div>
      </div>

      {/* Estatísticas Mensais */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Resumo Mensal
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {monthlyStats.map(renderStatCard)}
        </div>
      </div>

      {/* Status das Manutenções */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Status das Manutenções
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statusStats.map(renderStatCard)}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
