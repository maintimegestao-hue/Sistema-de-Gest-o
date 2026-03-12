import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useSecureReportsByClient } from '@/hooks/useSecureReportsByClient';
import { useSecureEquipments } from '@/hooks/useSecureEquipments';
import { useSecureTechnicians } from '@/hooks/useSecureTechnicians';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileBarChart, Download, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ClientTechnicalReports = () => {
  const { clientData } = useClientAuth();
  const navigate = useNavigate();

  const { data: reports, isLoading: reportsLoading } = useSecureReportsByClient(clientData?.clientId);
  const { data: equipments } = useSecureEquipments(clientData?.clientId);
  const { data: technicians } = useSecureTechnicians();

  if (reportsLoading) {
    return <LoadingSpinner />;
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/client-dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-teal-100 rounded-lg p-2">
                  <FileBarChart className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Relatórios Técnicos
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {clientData?.clientName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Relatórios Técnicos
          </h2>
          <p className="text-muted-foreground">
            Acesse relatórios técnicos detalhados dos seus equipamentos
          </p>
        </div>

        <div className="space-y-4">
          {reports?.map((report) => {
            const equipment = equipments?.find(eq => eq.id === report.equipment_id);
            const technician = technicians?.find(tech => tech.id === report.technician_id);

            return (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {equipment?.name || 'Equipamento não identificado'} • {new Date(report.report_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Relatório Técnico</Badge>
                      <Badge variant="default">Finalizado</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Técnico Responsável</h4>
                      <p className="text-sm text-muted-foreground">
                        {technician?.name || 'Não identificado'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Descrição</h4>
                      <p className="text-sm text-muted-foreground">
                        {report.description || 'Sem descrição disponível'}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <p className="text-sm font-medium">Relatório gerado em</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                        {report.attachment_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={report.attachment_url} download>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClientTechnicalReports;