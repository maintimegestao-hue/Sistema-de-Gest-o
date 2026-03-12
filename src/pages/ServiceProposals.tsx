
import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Plus } from 'lucide-react';
import { useServiceProposalsByClient } from '@/hooks/useServiceProposalsByClient';
import { useDeleteServiceProposal } from '@/hooks/useDeleteServiceProposal';
import { format } from 'date-fns';
import ProposalActions from '@/components/service-proposals/ProposalActions';
import ProposalViewModal from '@/components/service-proposals/ProposalViewModal';
import FormModal from '@/components/modals/FormModal';
import NewServiceProposalForm from '@/components/forms/NewServiceProposalForm';
import { toast } from 'sonner';
import { useClientContext } from '@/contexts/ClientContext';
import ClientSelector from '@/components/dashboard/ClientSelector';
import ClientHeader from '@/components/dashboard/ClientHeader';

const ServiceProposals = () => {
  const { selectedClientId } = useClientContext();
  const { data: proposals = [], isLoading } = useServiceProposalsByClient(selectedClientId);
  const deleteProposal = useDeleteServiceProposal();
  const [isNewProposalModalOpen, setIsNewProposalModalOpen] = useState(false);
  const [isEditProposalModalOpen, setIsEditProposalModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<any>(null);
  const [viewingProposal, setViewingProposal] = useState<any>(null);

  // Se nenhum cliente foi selecionado, mostra o seletor
  if (!selectedClientId) {
    return <ClientSelector />;
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'secondary' as const },
      sent: { label: 'Enviada', variant: 'default' as const },
      approved: { label: 'Aprovada', variant: 'default' as const },
      rejected: { label: 'Rejeitada', variant: 'destructive' as const },
      expired: { label: 'Expirada', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleView = (proposal: any) => {
    console.log('Abrindo visualização da proposta:', proposal);
    setViewingProposal(proposal);
    setIsViewModalOpen(true);
  };

  const handleEdit = (proposal: any) => {
    console.log('Editando proposta:', proposal);
    setEditingProposal(proposal);
    setIsEditProposalModalOpen(true);
  };

  const handleDelete = (proposal: any) => {
    console.log('Iniciando exclusão da proposta:', proposal.id);
    if (window.confirm(`Tem certeza que deseja excluir a proposta "${proposal.title}"?`)) {
      deleteProposal.mutate(proposal.id);
    }
  };

  const handleSend = (proposal: any) => {
    console.log('Enviando proposta:', proposal);
    toast.success(`📤 Proposta "${proposal.title}" foi enviada!`);
    // TODO: Implementar envio real no futuro
  };

  const handleNewProposalSuccess = () => {
    setIsNewProposalModalOpen(false);
    toast.success('Proposta Criada Com Sucesso!');
  };

  const handleEditProposalSuccess = () => {
    setIsEditProposalModalOpen(false);
    setEditingProposal(null);
    toast.success('✅ Proposta atualizada com sucesso!');
  };

  const handleCloseEditModal = () => {
    setIsEditProposalModalOpen(false);
    setEditingProposal(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingProposal(null);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout>
        <div className="p-6">
          <ClientHeader />
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Propostas de Serviço</h1>
              <p className="text-muted-foreground">Gerencie suas propostas comerciais</p>
            </div>
            <Button 
              onClick={() => setIsNewProposalModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Proposta
            </Button>
          </div>

          {proposals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileCheck className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhuma proposta encontrada
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  Comece criando sua primeira proposta de serviço
                </p>
                <Button 
                  className="evolutec-btn"
                  onClick={() => setIsNewProposalModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Proposta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proposals.map((proposal) => (
                <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-evolutec-black">
                        {proposal.title}
                      </CardTitle>
                      {getStatusBadge(proposal.status)}
                    </div>
                    <div className="text-sm text-evolutec-text">
                      #{proposal.proposal_number}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="font-medium">Cliente:</span>
                        <div className="text-evolutec-text">
                          Cliente Selecionado
                        </div>
                      </div>

                      {proposal.equipments && (
                        <div className="text-sm">
                          <span className="font-medium">Equipamento:</span>
                          <div className="text-evolutec-text">
                            {proposal.equipments.name}
                          </div>
                        </div>
                      )}

                      <div className="text-sm">
                        <span className="font-medium">Valor Total:</span>
                        <div className="text-lg font-bold text-evolutec-green">
                          R$ {proposal.total_cost?.toFixed(2) || '0.00'}
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="font-medium">Criada em:</span>
                        <div className="text-evolutec-text">
                          {format(new Date(proposal.created_at), 'dd/MM/yyyy')}
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="font-medium">Validade:</span>
                        <div className="text-evolutec-text">
                          {proposal.validity_days} dias
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <ProposalActions
                          proposal={proposal}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onSend={handleSend}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Modal para Nova Proposta */}
      <FormModal
        isOpen={isNewProposalModalOpen}
        onClose={() => setIsNewProposalModalOpen(false)}
        title="Nova Proposta de Serviço"
      >
        <NewServiceProposalForm onSuccess={handleNewProposalSuccess} />
      </FormModal>

      {/* Modal para Editar Proposta */}
      <FormModal
        isOpen={isEditProposalModalOpen}
        onClose={handleCloseEditModal}
        title="Editar Proposta de Serviço"
      >
        <NewServiceProposalForm 
          onSuccess={handleEditProposalSuccess} 
          initialData={editingProposal}
        />
      </FormModal>

      {/* Modal para Visualizar Proposta */}
      <ProposalViewModal
        proposal={viewingProposal}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
      />
    </>
  );
};

export default ServiceProposals;
