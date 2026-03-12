import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, GripVertical, Edit, Settings } from 'lucide-react';
import { usePipelineStages } from '@/hooks/usePipeline';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface PipelineStageConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PipelineStageConfigModal = ({ isOpen, onClose }: PipelineStageConfigModalProps) => {
  const { data: stages, isLoading } = usePipelineStages();
  const [editingStages, setEditingStages] = useState(stages || []);
  const [editingFieldsStageId, setEditingFieldsStageId] = useState<string | null>(null);

  React.useEffect(() => {
    if (stages) {
      setEditingStages([...stages]);
    }
  }, [stages]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(editingStages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update stage_order
    const updatedItems = items.map((item, index) => ({
      ...item,
      stage_order: index + 1,
    }));

    setEditingStages(updatedItems);
  };

  const updateStageName = (index: number, name: string) => {
    const updated = [...editingStages];
    updated[index] = { ...updated[index], name };
    setEditingStages(updated);
  };

  const updateStageColor = (index: number, color: string) => {
    const updated = [...editingStages];
    updated[index] = { ...updated[index], color };
    setEditingStages(updated);
  };

  const addNewStage = () => {
    const newStage = {
      id: `temp-${Date.now()}`,
      user_id: editingStages[0]?.user_id || '',
      name: 'Nova Etapa',
      stage_order: editingStages.length + 1,
      color: '#6B7280',
      required_fields: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEditingStages([...editingStages, newStage]);
  };

  const removeStage = (index: number) => {
    const updated = editingStages.filter((_, i) => i !== index);
    const reordered = updated.map((stage, i) => ({
      ...stage,
      stage_order: i + 1,
    }));
    setEditingStages(reordered);
  };

  const saveChanges = () => {
    // TODO: Implementar salvamento das mudanças
    console.log('Salvando mudanças:', editingStages);
    onClose();
  };

  const predefinedColors = [
    '#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', 
    '#06B6D4', '#EF4444', '#F97316', '#22C55E',
    '#6B7280', '#EC4899', '#8B5A2B', '#0F766E'
  ];

  const businessFields = [
    'data_conclusao', 'valor_total', 'descricao', 'motivo_perda', 
    'descricao_motivo_perda', 'probabilidade', 'prazo_fechamento',
    'origem_lead', 'status_negociacao', 'relatorio_visita_tecnica',
    'proposta', 'email_envio_cliente', 'aprovacao_gerencia',
    'pedido_compra', 'email_aprovacao_cliente', 'relatorio_conclusao_sc',
    'ordem_pagamento'
  ];

  const personFields = [
    'cpf', 'cargo', 'aniversario', 'ano_nascimento', 'categoria', 
    'origem', 'descricao', 'email', 'whatsapp', 'telefone', 'celular',
    'cep', 'pais', 'estado', 'cidade', 'bairro', 'rua', 'numero', 
    'complemento', 'produto_servico', 'linkedin', 'facebook', 'instagram',
    'twitter', 'youtube', 'tiktok'
  ];

  const companyFields = [
    'razao_social', 'cnpj', 'categoria', 'origem', 'setor', 'descricao',
    'email', 'whatsapp', 'telefone', 'celular', 'cep', 'ramal', 'pais',
    'estado', 'cidade', 'bairro', 'rua', 'numero', 'complemento',
    'produto_servico', 'linkedin', 'facebook', 'instagram', 'twitter',
    'youtube', 'tiktok', 'website'
  ];

  const fieldLabels: Record<string, string> = {
    // Business fields
    data_conclusao: 'Data da Conclusão',
    valor_total: 'Valor Total',
    descricao: 'Descrição',
    motivo_perda: 'Motivo de Perda',
    descricao_motivo_perda: 'Descrição do Motivo da Perda',
    probabilidade: 'Probabilidade',
    prazo_fechamento: 'Prazo de Fechamento',
    origem_lead: 'Origem do Lead',
    status_negociacao: 'Status da Negociação',
    relatorio_visita_tecnica: 'Relatório de Visita Técnica',
    proposta: 'Proposta',
    email_envio_cliente: 'Email de Envio ao Cliente',
    aprovacao_gerencia: 'Aprovação Gerência',
    pedido_compra: 'Pedido de Compra',
    email_aprovacao_cliente: 'Email ou Mensagem de Aprovação Cliente',
    relatorio_conclusao_sc: 'Relatório de Conclusão SC',
    ordem_pagamento: 'Ordem de Pagamento',
    
    // Person fields
    cpf: 'CPF',
    cargo: 'Cargo',
    aniversario: 'Aniversário',
    ano_nascimento: 'Ano de Nascimento',
    categoria: 'Categoria',
    origem: 'Origem',
    email: 'Email',
    whatsapp: 'WhatsApp',
    telefone: 'Telefone',
    celular: 'Celular',
    cep: 'CEP',
    pais: 'País',
    estado: 'Estado',
    cidade: 'Cidade',
    bairro: 'Bairro',
    rua: 'Rua',
    numero: 'Número',
    complemento: 'Complemento',
    produto_servico: 'Produto/Serviço',
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    
    // Company fields
    razao_social: 'Razão Social',
    cnpj: 'CNPJ',
    setor: 'Setor',
    ramal: 'Ramal',
    website: 'Website'
  };

  const updateStageFields = (stageId: string, fields: string[]) => {
    const updated = editingStages.map(stage =>
      stage.id === stageId ? { ...stage, required_fields: fields } : stage
    );
    setEditingStages(updated);
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Etapas do Funil</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Arraste para reordenar as etapas do funil
            </p>
            <Button onClick={addNewStage} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Etapa
            </Button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="stages">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {editingStages.map((stage, index) => (
                    <Draggable key={stage.id} draggableId={stage.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${snapshot.isDragging ? 'shadow-lg' : ''}`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="h-5 w-5 text-gray-400" />
                              </div>
                              
                              <Badge 
                                variant="secondary" 
                                style={{ backgroundColor: stage.color, color: 'white' }}
                              >
                                {stage.stage_order}
                              </Badge>

                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor={`stage-name-${index}`} className="text-xs">
                                    Nome da Etapa
                                  </Label>
                                  <Input
                                    id={`stage-name-${index}`}
                                    value={stage.name}
                                    onChange={(e) => updateStageName(index, e.target.value)}
                                    className="h-8"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor={`stage-color-${index}`} className="text-xs">
                                    Cor
                                  </Label>
                                  <div className="flex gap-1 flex-wrap">
                                    {predefinedColors.map((color) => (
                                      <button
                                        key={color}
                                        type="button"
                                        className={`w-6 h-6 rounded border-2 ${
                                          stage.color === color ? 'border-gray-800' : 'border-gray-300'
                                        }`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => updateStageColor(index, color)}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingFieldsStageId(stage.id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStage(index)}
                                disabled={editingStages.length <= 1}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>

                          <CardContent className="pt-0">
                            <div className="text-xs text-gray-500">
                              Campos obrigatórios: {stage.required_fields?.join(', ') || 'Nenhum'}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={saveChanges}>
              Salvar Configurações
            </Button>
          </div>
        </div>

        {/* Field Configuration Modal */}
        {editingFieldsStageId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">
                    Configurar Campos - {editingStages.find(s => s.id === editingFieldsStageId)?.name}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingFieldsStageId(null)}
                  >
                    ×
                  </Button>
                </div>

                <Tabs defaultValue="business" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="business">Campos de Negócio</TabsTrigger>
                    <TabsTrigger value="person">Campos de Pessoa</TabsTrigger>
                    <TabsTrigger value="company">Campos de Empresa</TabsTrigger>
                  </TabsList>

                  <TabsContent value="business" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {businessFields.map((field) => (
                        <div key={field} className="flex items-center space-x-2">
                          <Checkbox
                            id={`business-${field}`}
                            checked={editingStages.find(s => s.id === editingFieldsStageId)?.required_fields?.includes(field) || false}
                            onCheckedChange={(checked) => {
                              const stage = editingStages.find(s => s.id === editingFieldsStageId);
                              const currentFields = stage?.required_fields || [];
                              const newFields = checked 
                                ? [...currentFields, field]
                                : currentFields.filter(f => f !== field);
                              updateStageFields(editingFieldsStageId, newFields);
                            }}
                          />
                          <Label htmlFor={`business-${field}`} className="text-sm">
                            {fieldLabels[field] || field}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="person" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {personFields.map((field) => (
                        <div key={field} className="flex items-center space-x-2">
                          <Checkbox
                            id={`person-${field}`}
                            checked={editingStages.find(s => s.id === editingFieldsStageId)?.required_fields?.includes(field) || false}
                            onCheckedChange={(checked) => {
                              const stage = editingStages.find(s => s.id === editingFieldsStageId);
                              const currentFields = stage?.required_fields || [];
                              const newFields = checked 
                                ? [...currentFields, field]
                                : currentFields.filter(f => f !== field);
                              updateStageFields(editingFieldsStageId, newFields);
                            }}
                          />
                          <Label htmlFor={`person-${field}`} className="text-sm">
                            {fieldLabels[field] || field}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="company" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {companyFields.map((field) => (
                        <div key={field} className="flex items-center space-x-2">
                          <Checkbox
                            id={`company-${field}`}
                            checked={editingStages.find(s => s.id === editingFieldsStageId)?.required_fields?.includes(field) || false}
                            onCheckedChange={(checked) => {
                              const stage = editingStages.find(s => s.id === editingFieldsStageId);
                              const currentFields = stage?.required_fields || [];
                              const newFields = checked 
                                ? [...currentFields, field]
                                : currentFields.filter(f => f !== field);
                              updateStageFields(editingFieldsStageId, newFields);
                            }}
                          />
                          <Label htmlFor={`company-${field}`} className="text-sm">
                            {fieldLabels[field] || field}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6">
                  <Label htmlFor="qualification-question" className="text-sm font-medium">
                    Pergunta de Qualificação (opcional)
                  </Label>
                  <Textarea
                    id="qualification-question"
                    placeholder="Digite uma pergunta de qualificação para esta etapa..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                  <Button variant="outline" onClick={() => setEditingFieldsStageId(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setEditingFieldsStageId(null)}>
                    Salvar Campos
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PipelineStageConfigModal;