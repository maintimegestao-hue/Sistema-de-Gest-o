
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import ProposalDownloadButtons from './ProposalDownloadButtons';

interface ProposalViewModalProps {
  proposal: any;
  isOpen: boolean;
  onClose: () => void;
}

const ProposalViewModal: React.FC<ProposalViewModalProps> = ({
  proposal,
  isOpen,
  onClose
}) => {
  const [fullProposal, setFullProposal] = useState<any>(null);

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

  // Buscar dados completos quando necessário
  const getFullProposalData = async () => {
    if (fullProposal) return fullProposal;
    
    try {
      const { data, error } = await supabase
        .from('service_proposals')
        .select(`
          *,
          clients(name, address, city, state, zip_code, phone, email, contact_person, cnpj),
          equipments(name),
          profiles!service_proposals_user_id_fkey(company_logo_url)
        `)
        .eq('id', proposal.id)
        .single();

      if (error) throw error;
      const proposalData = data || proposal;
      
      // Adicionar o logo da empresa no proposalData
      if (proposalData.profiles?.company_logo_url) {
        proposalData.company_logo = proposalData.profiles.company_logo_url;
      }
      
      setFullProposal(proposalData);
      return proposalData;
    } catch (error) {
      console.error('Erro ao buscar dados da proposta:', error);
      return proposal;
    }
  };

  if (!proposal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl text-evolutec-black">
                {proposal.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-evolutec-text">
                  #{proposal.proposal_number}
                </span>
                {getStatusBadge(proposal.status)}
              </div>
            </div>
            <ProposalDownloadButtons 
              proposalData={proposal} 
              proposalTitle={proposal.title}
              onGetFullData={getFullProposalData}
            />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-evolutec-black mb-2">Informações Gerais</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Cliente:</span>
                  <span className="ml-2">{proposal.clients?.name || 'N/A'}</span>
                </div>
                {proposal.equipments && (
                  <div>
                    <span className="font-medium">Equipamento:</span>
                    <span className="ml-2">{proposal.equipments.name}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium">Criada em:</span>
                  <span className="ml-2">
                    {format(new Date(proposal.created_at), 'dd/MM/yyyy')}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Validade:</span>
                  <span className="ml-2">{proposal.validity_days} dias</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-evolutec-black mb-2">Valores</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Mão de obra:</span>
                  <span className="ml-2">R$ {proposal.labor_cost?.toFixed(2) || '0.00'}</span>
                </div>
                <div>
                  <span className="font-medium">Materiais:</span>
                  <span className="ml-2">R$ {proposal.materials_cost?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="border-t pt-2">
                  <span className="font-bold text-evolutec-green">Total:</span>
                  <span className="ml-2 font-bold text-evolutec-green text-lg">
                    R$ {proposal.total_cost?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Descrição */}
          {proposal.description && (
            <div>
              <h3 className="font-semibold text-evolutec-black mb-2">Descrição</h3>
              <p className="text-sm text-evolutec-text bg-gray-50 p-3 rounded">
                {proposal.description}
              </p>
            </div>
          )}

          {/* Escopo de Trabalho */}
          <div>
            <h3 className="font-semibold text-evolutec-black mb-2">Escopo de Trabalho</h3>
            <p className="text-sm text-evolutec-text bg-gray-50 p-3 rounded">
              {proposal.scope_of_work}
            </p>
          </div>

          {/* Duração Estimada */}
          {proposal.estimated_duration && (
            <div>
              <h3 className="font-semibold text-evolutec-black mb-2">Duração Estimada</h3>
              <p className="text-sm text-evolutec-text">
                {proposal.estimated_duration} dias
              </p>
            </div>
          )}

          {/* Termos e Condições */}
          {proposal.terms_and_conditions && (
            <div>
              <h3 className="font-semibold text-evolutec-black mb-2">Termos e Condições</h3>
              <div className="text-xs text-evolutec-text bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{proposal.terms_and_conditions}</pre>
              </div>
            </div>
          )}

          {/* Observações */}
          {proposal.notes && (
            <div>
              <h3 className="font-semibold text-evolutec-black mb-2">Observações</h3>
              <p className="text-sm text-evolutec-text bg-gray-50 p-3 rounded">
                {proposal.notes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalViewModal;
