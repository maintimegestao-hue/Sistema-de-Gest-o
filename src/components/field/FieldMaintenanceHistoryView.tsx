import React from 'react';
import { useFieldMaintenanceHistory } from '@/hooks/useFieldMaintenanceHistory';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, CheckCircle, Wrench, Clock } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface FieldMaintenanceHistoryViewProps {
  onBack: () => void;
}

const FieldMaintenanceHistoryView: React.FC<FieldMaintenanceHistoryViewProps> = ({ onBack }) => {
  const { data: maintenanceHistory, isLoading, error } = useFieldMaintenanceHistory();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">Erro ao carregar histórico de manutenções</div>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const getMaintenanceTypeLabel = (type: string) => {
    switch (type) {
      case 'preventive':
        return 'Preventiva';
      case 'corrective':
        return 'Corretiva';
      case 'predictive':
        return 'Preditiva';
      default:
        return type;
    }
  };

  const getMaintenanceTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'corrective':
        return <Wrench className="w-4 h-4 text-red-500" />;
      case 'predictive':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Wrench className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-2xl font-bold text-evolutec-black">
            Histórico de Manutenções Realizadas
          </h2>
        </div>
      </div>

      {!maintenanceHistory || maintenanceHistory.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Nenhuma manutenção encontrada
          </h3>
          <p className="text-gray-500">
            As manutenções finalizadas aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            {maintenanceHistory.length} manutenção(ões) encontrada(s)
          </div>
          
          {maintenanceHistory.map((maintenance) => (
            <div
              key={maintenance.id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getMaintenanceTypeIcon(maintenance.maintenance_type)}
                    <h3 className="text-lg font-semibold text-evolutec-black">
                      {maintenance.equipment_name}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Concluída
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Cliente:</span>
                      <span className="ml-2 text-gray-600">{maintenance.client_name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Tipo:</span>
                      <span className="ml-2 text-gray-600">
                        {getMaintenanceTypeLabel(maintenance.maintenance_type)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Data Programada:</span>
                      <span className="ml-2 text-gray-600">
                        {new Date(maintenance.scheduled_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Finalizada em:</span>
                      <span className="ml-2 text-gray-600">
                        {new Date(maintenance.updated_at).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(maintenance.updated_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {maintenance.description && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700 text-sm">Descrição:</span>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                        {maintenance.description}
                      </p>
                    </div>
                  )}

                  {maintenance.observations && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700 text-sm">Observações:</span>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                        {maintenance.observations}
                      </p>
                    </div>
                  )}

                  {/* Checklist com imagens */}
                  {maintenance.checklist_items && Array.isArray(maintenance.checklist_items) && maintenance.checklist_items.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700 text-sm mb-3 block">Checklist Executado:</span>
                      <div className="space-y-3">
                        {maintenance.checklist_items.map((item: any, index: number) => (
                          <div key={index} className="border-l-4 border-green-500 pl-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-gray-700 font-medium">
                                  {typeof item === 'string' ? item : item.item || 'Item não especificado'}
                                </p>
                                {typeof item === 'object' && item.status && (
                                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                                    item.status === 'conforme' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {item.status === 'conforme' ? 'Conforme' : 'Não Conforme'}
                                  </span>
                                )}
                                {typeof item === 'object' && item.comment && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    Comentário: {item.comment}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Imagens dos anexos */}
                            {typeof item === 'object' && item.attachments && Array.isArray(item.attachments) && item.attachments.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-gray-500 block mb-2">Anexos:</span>
                                <div className="flex flex-wrap gap-2">
                                  {item.attachments.map((attachment: any, attachIndex: number) => {
                                    // Normalizar URL para garantir que funciona
                                    let imageUrl = attachment.url || attachment.file || attachment;
                                    if (typeof imageUrl === 'string' && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                                      imageUrl = `https://umrkqohjbhcrxvnvvvli.supabase.co/storage/v1/object/public/maintenance-attachments/${imageUrl}`;
                                    }
                                    
                                    if (!imageUrl || typeof imageUrl !== 'string') {
                                      return null; // Skip se não for uma URL válida
                                    }

                                    return (
                                      <div key={attachIndex} className="relative">
                                        <img
                                          src={imageUrl}
                                          alt={attachment.comment || 'Anexo'}
                                          className="w-24 h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                                          onClick={() => window.open(imageUrl, '_blank')}
                                          onError={(e) => {
                                            console.log('Erro ao carregar imagem:', imageUrl);
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                        {attachment.comment && (
                                          <p className="text-xs text-gray-500 mt-1 text-center max-w-24 truncate">
                                            {attachment.comment}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FieldMaintenanceHistoryView;