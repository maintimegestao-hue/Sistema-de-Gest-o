
import React from 'react';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { useClientComparison } from '@/hooks/useClientComparison';
import { useUserProfile } from '@/hooks/useUserProfile';

const ClientComparison = () => {
  const { data: profile } = useUserProfile();
  const { data: clientStats, isLoading } = useClientComparison();

  // Verificar se o usuário é admin
  if (profile?.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p className="text-gray-600 mt-2">Esta página é acessível apenas para administradores.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p>Carregando dados comparativos...</p>
        </div>
      </DashboardLayout>
    );
  }

  const getComplianceColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getComplianceBadge = (score: number) => {
    if (score >= 8) return <Badge className="bg-green-500">Excelente</Badge>;
    if (score >= 6) return <Badge className="bg-yellow-500">Bom</Badge>;
    return <Badge className="bg-red-500">Crítico</Badge>;
  };

  // Dados para gráficos
  const barChartData = clientStats?.map(client => ({
    name: client.client_name.substring(0, 10) + '...',
    manutencoes: client.monthly_orders,
    equipamentos: client.total_equipments
  })) || [];

  const pieChartData = [
    { name: 'No Prazo', value: clientStats?.reduce((acc, curr) => acc + curr.completed_on_time_percentage, 0) || 0 },
    { name: 'Atrasadas', value: clientStats?.reduce((acc, curr) => acc + (100 - curr.completed_on_time_percentage), 0) || 0 }
  ];

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-evolutec-black">Painel Comparativo de Clientes</h1>
            <p className="text-evolutec-text mt-2">
              Análise comparativa de desempenho e conformidade por cliente
            </p>
          </div>
          <Button className="evolutec-btn">
            <Download size={16} className="mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientStats?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Equipamentos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clientStats?.reduce((acc, curr) => acc + curr.total_equipments, 0) || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">O.S. Mensal</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clientStats?.reduce((acc, curr) => acc + curr.monthly_orders, 0) || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atrasos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {clientStats?.reduce((acc, curr) => acc + curr.overdue_maintenances, 0) || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Manutenções por Cliente</CardTitle>
              <CardDescription>Comparativo mensal de ordens de serviço</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="manutencoes" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Geral</CardTitle>
              <CardDescription>Distribuição de manutenções no prazo vs atrasadas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabela Comparativa */}
        <Card>
          <CardHeader>
            <CardTitle>Comparativo Detalhado por Cliente</CardTitle>
            <CardDescription>
              Indicadores de performance e conformidade de todos os clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Equipamentos</TableHead>
                  <TableHead>O.S. Mensais</TableHead>
                  <TableHead>% No Prazo</TableHead>
                  <TableHead>Atrasos</TableHead>
                  <TableHead>Relatórios</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientStats?.map((client) => (
                  <TableRow key={client.client_id}>
                    <TableCell className="font-medium">{client.client_name}</TableCell>
                    <TableCell>{client.total_equipments}</TableCell>
                    <TableCell>{client.monthly_orders}</TableCell>
                    <TableCell>{client.completed_on_time_percentage.toFixed(1)}%</TableCell>
                    <TableCell className="text-red-600">{client.overdue_maintenances}</TableCell>
                    <TableCell>{client.reports_generated}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getComplianceColor(client.compliance_score)}`}></div>
                        <span>{client.compliance_score.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getComplianceBadge(client.compliance_score)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientComparison;
