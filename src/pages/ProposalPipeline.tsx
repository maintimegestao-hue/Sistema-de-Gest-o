import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, Settings, Download } from 'lucide-react';
import PipelineBoard from '@/components/pipeline/PipelineBoard';
import PipelineStageConfigModal from '@/components/pipeline/PipelineStageConfigModal';
import { useClients } from '@/hooks/useClients';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const ProposalPipeline = () => {
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const { data: clients } = useClients();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Funil de Acompanhamento SC
            </h1>
            <p className="text-gray-600 mt-2">
              Acompanhe o progresso das suas propostas de serviços corretivos
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsConfigModalOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar Etapas
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select
                  value={selectedClientId}
                  onValueChange={setSelectedClientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar cliente para filtrar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os clientes</SelectItem>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedClientId && selectedClientId !== 'all' && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    Filtrado por: {clients?.find(c => c.id === selectedClientId)?.name}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedClientId('all')}
                  >
                    Limpar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Board */}
        <div className="bg-white rounded-lg border">
          <PipelineBoard selectedClientId={selectedClientId === 'all' ? undefined : selectedClientId} />
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Como funciona o funil?
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Cada etapa possui campos obrigatórios que devem ser preenchidos</li>
                  <li>• Arraste os cartões entre as etapas para mover as propostas</li>
                  <li>• Se os campos não estiverem completos, será aberta a tela de edição</li>
                  <li>• Use os filtros para visualizar propostas de clientes específicos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <PipelineStageConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
};

export default ProposalPipeline;