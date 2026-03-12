import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useClientEquipments } from '@/hooks/useClientEquipments';
import { useCreateServiceCall } from '@/hooks/useServiceCallMutations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Phone, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ClientServiceCallForm = () => {
  const { equipmentId } = useParams<{ equipmentId: string }>();
  const { clientData } = useClientAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: equipments, isLoading } = useClientEquipments(clientData?.clientId);
  const createServiceCall = useCreateServiceCall();

  // Estados do formulário
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);

  const equipment = equipments?.find(eq => eq.id === equipmentId);

  const problemOptions = [
    { id: 'barulho', label: 'Barulho', severity: 'medium' },
    { id: 'nao_gela', label: 'Não gela', severity: 'high' },
    { id: 'nao_liga', label: 'Não liga', severity: 'high' },
    { id: 'pingando_agua', label: 'Pingando água', severity: 'medium' },
    { id: 'vibrando', label: 'Vibrando', severity: 'low' },
    { id: 'congelando', label: 'Congelando', severity: 'medium' },
    { id: 'gela_muito', label: 'Gela muito', severity: 'low' },
    { id: 'nao_desliga', label: 'Não desliga', severity: 'medium' },
    { id: 'caindo_da_parede', label: 'Caindo da parede', severity: 'high' },
    { id: 'mal_cheiro', label: 'Mal cheiro', severity: 'medium' },
  ];

  const handleProblemToggle = (problemId: string) => {
    setSelectedProblems(prev => 
      prev.includes(problemId) 
        ? prev.filter(id => id !== problemId)
        : [...prev, problemId]
    );
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos = Array.from(files).slice(0, 5 - photos.length); // Máximo 5 fotos
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const handleSubmit = async () => {
    if (selectedProblems.length === 0) {
      toast.error('Selecione pelo menos um problema');
      return;
    }

    if (!description.trim()) {
      toast.error('Descreva o problema observado');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload das fotos se houver
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        console.log('Fazendo upload de', photos.length, 'fotos...');
        const uploadPromises = photos.map(async (photo, index) => {
          const fileName = `service-call-${Date.now()}-${index}.${photo.name.split('.').pop()}`;
          const { data, error } = await supabase.storage
            .from('maintenance-attachments')
            .upload(fileName, photo);
          
          if (error) {
            console.error('Erro no upload da foto:', error);
            throw error;
          }
          
          const { data: urlData } = supabase.storage
            .from('maintenance-attachments')
            .getPublicUrl(fileName);
            
          return urlData.publicUrl;
        });

        photoUrls = await Promise.all(uploadPromises);
        console.log('Upload das fotos concluído:', photoUrls);
      }

      // Criar chamado via mutation hook
      const clientAccessCode = localStorage.getItem('client_access_code') || undefined;
      
      const callData = await createServiceCall.mutateAsync({
        clientId: clientData?.clientId,
        equipmentId,
        problemTypes: selectedProblems,
        description,
        photos: photoUrls,
        clientNotes: description,
        ...(clientAccessCode ? { accessCode: clientAccessCode } : {})
      });

      // Navegar para a página de sucesso
      navigate('/client-service-call/success', { 
        state: { callData: callData.data } 
      });

    } catch (error) {
      console.error('Erro ao criar chamado:', error);
      // O erro já é tratado pelo hook de mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!equipment || equipment.client_id !== clientData?.clientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Equipamento não encontrado</h3>
            <p className="text-muted-foreground mb-4">
              O equipamento selecionado não foi encontrado ou não pertence ao seu cliente.
            </p>
            <Button onClick={() => navigate('/client-service-call')}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/client-service-call/equipment-list')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-red-100 rounded-lg p-2">
                  <Phone className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Abrir Chamado
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {equipment.name} - {equipment.installation_location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações do equipamento */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Equipamento Selecionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Nome</Label>
                <p className="text-sm text-muted-foreground">{equipment.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Localização</Label>
                <p className="text-sm text-muted-foreground">{equipment.installation_location}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge variant={equipment.status === 'operational' ? 'default' : 'secondary'}>
                  {equipment.status === 'operational' ? 'Operacional' : 'Em Manutenção'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário do chamado */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Problema</CardTitle>
            <p className="text-sm text-muted-foreground">
              Selecione os problemas observados e descreva a situação
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seleção de problemas */}
            <div>
              <Label className="text-base font-medium">Que tipo de problema você observou?</Label>
              <p className="text-sm text-muted-foreground mb-4">Selecione uma ou mais opções</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {problemOptions.map((problem) => (
                  <div key={problem.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={problem.id}
                      checked={selectedProblems.includes(problem.id)}
                      onCheckedChange={() => handleProblemToggle(problem.id)}
                    />
                    <Label 
                      htmlFor={problem.id} 
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {problem.label}
                      <Badge variant={getSeverityColor(problem.severity)} className="text-xs">
                        {problem.severity === 'high' ? 'Alta' : 
                         problem.severity === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="description" className="text-base font-medium">
                Descrição detalhada do problema *
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Descreva o que você observou, quando começou e qualquer informação relevante
              </p>
              <Textarea
                id="description"
                placeholder="Ex: O ar condicionado não está gelando desde ontem. O equipamento liga normalmente, mas o ar que sai está na temperatura ambiente. Não há vazamentos visíveis..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Upload de fotos */}
            <div>
              <Label className="text-base font-medium">Anexar fotos (opcional)</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Máximo 5 fotos para ajudar na identificação do problema
              </p>
              
              {photos.length < 5 && (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <span className="text-sm font-medium text-primary">Clique para adicionar fotos</span>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG ou WebP até 10MB cada
                  </p>
                </div>
              )}

              {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removePhoto(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex gap-4 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={() => navigate('/client-service-call/equipment-list')}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || selectedProblems.length === 0 || !description.trim()}
                className="flex-1"
              >
                {isSubmitting ? 'Criando chamado...' : 'Abrir Chamado'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientServiceCallForm;