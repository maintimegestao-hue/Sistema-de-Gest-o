import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, FileText, DollarSign, Calendar, User } from 'lucide-react';
import { usePipelineStages, usePipelineItems, useMovePipelineItem } from '@/hooks/usePipeline';
import { PipelineItem, PipelineStage } from '@/hooks/usePipeline';

import PipelineItemModal from './PipelineItemModal';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function for currency formatting
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface PipelineBoardProps {
  selectedClientId?: string;
}

const PipelineBoard = ({ selectedClientId }: PipelineBoardProps) => {
  const [selectedItem, setSelectedItem] = useState<PipelineItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newItemStageId, setNewItemStageId] = useState<string>('');

  const { data: stages, isLoading: stagesLoading } = usePipelineStages();
  const { data: items, isLoading: itemsLoading } = usePipelineItems(selectedClientId);
  const movePipelineItem = useMovePipelineItem();

  const getItemsByStage = (stageId: string) => {
    return items?.filter(item => item.stage_id === stageId) || [];
  };

  const validateStageCompletion = (item: PipelineItem, targetStage: PipelineStage): boolean => {
    // Implementar validação baseada nos campos obrigatórios
    const requiredFields = targetStage.required_fields || [];
    
    for (const field of requiredFields) {
      if (!item.stage_data?.[field]) {
        return false;
      }
    }
    
    return true;
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const item = items?.find(i => i.id === draggableId);
    const targetStage = stages?.find(s => s.id === destination.droppableId);

    if (!item || !targetStage) return;

    // Validar se o item pode ser movido
    if (!validateStageCompletion(item, targetStage)) {
      // Mostrar modal de edição para completar campos obrigatórios
      setSelectedItem(item);
      setIsModalOpen(true);
      return;
    }

    movePipelineItem.mutate({
      itemId: item.id,
      newStageId: destination.droppableId,
    });
  };

  const handleCreateNew = (stageId: string) => {
    setNewItemStageId(stageId);
    setSelectedItem(null);
    setIsCreatingNew(true);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: PipelineItem) => {
    setSelectedItem(item);
    setIsCreatingNew(false);
    setIsModalOpen(true);
  };

  if (stagesLoading || itemsLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-4" style={{ minWidth: `${(stages?.length || 0) * 320}px` }}>
            {stages?.map((stage) => (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <div 
                  className="flex items-center justify-between p-3 rounded-t-lg text-white font-medium"
                  style={{ backgroundColor: stage.color }}
                >
                  <span className="text-sm font-semibold">{stage.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {getItemsByStage(stage.id).length}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-white hover:bg-white/20"
                      onClick={() => handleCreateNew(stage.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-3 space-y-3 bg-gray-50 border-x border-b rounded-b-lg min-h-[500px] ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {getItemsByStage(stage.id).map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-pointer hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg rotate-3' : ''
                              }`}
                              onClick={() => handleEditItem(item)}
                            >
                              <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                                    {item.title}
                                  </h4>
                                  {item.service_proposals && (
                                    <Badge variant="outline" className="text-xs">
                                      {item.service_proposals.proposal_number}
                                    </Badge>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0 space-y-2">
                                {item.clients && (
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <User className="h-3 w-3" />
                                    <span className="truncate">{item.clients.name}</span>
                                  </div>
                                )}
                                
                                {item.value > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                    <DollarSign className="h-3 w-3" />
                                    <span>{formatCurrency(item.value)}</span>
                                  </div>
                                )}

                                {item.description && (
                                  <p className="text-xs text-gray-500 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}

                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {new Date(item.moved_at).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>

                                {Object.keys(item.stage_data || {}).length > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-blue-600">
                                    <FileText className="h-3 w-3" />
                                    <span>
                                      {Object.keys(item.stage_data).length} documento(s)
                                    </span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>

      <PipelineItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
        isCreating={isCreatingNew}
        stageId={newItemStageId}
        selectedClientId={selectedClientId}
      />
    </div>
  );
};

export default PipelineBoard;