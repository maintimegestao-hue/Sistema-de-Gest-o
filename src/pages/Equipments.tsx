import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import FormModal from "@/components/modals/FormModal";
import NewEquipmentForm from "@/components/forms/NewEquipmentForm";
import EditEquipmentForm from "@/components/forms/EditEquipmentForm";
import FilterModal from "@/components/filters/FilterModal";
import QRCodeLabel from "@/components/qr/QRCodeLabel";
import { useSecureEquipments, useDeleteSecureEquipment } from "@/hooks/useSecureEquipments";
import { sanitizeSearchTerm } from "@/lib/validation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import EquipmentHeader from "@/components/equipment/EquipmentHeader";
import EquipmentSearchBar from "@/components/equipment/EquipmentSearchBar";
import EquipmentGrid from "@/components/equipment/EquipmentGrid";
import { useClientContext } from "@/contexts/ClientContext";
import ClientSelector from "@/components/dashboard/ClientSelector";
import ClientHeader from "@/components/dashboard/ClientHeader";
import { useServiceCallsCount } from "@/hooks/useServiceCallsCount";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const Equipments = () => {
  const { selectedClientId } = useClientContext();
  const { data: userProfile } = useUserProfile();
  const { data: serviceCallsCount } = useServiceCallsCount(userProfile?.user_id);
  const [isNewEquipmentModalOpen, setIsNewEquipmentModalOpen] = useState(false);
  const [isEditEquipmentModalOpen, setIsEditEquipmentModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedEquipmentForLabel, setSelectedEquipmentForLabel] = useState<any>(null);
  const [selectedEquipmentForEdit, setSelectedEquipmentForEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<any>({});
  
  const { data: equipments, isLoading } = useSecureEquipments(selectedClientId);
  const deleteEquipmentMutation = useDeleteSecureEquipment();

  // Se nenhum cliente foi selecionado, mostra o seletor
  if (!selectedClientId) {
    return <ClientSelector />;
  }

  const handleNewEquipmentSuccess = () => {
    setIsNewEquipmentModalOpen(false);
  };

  const handleEditEquipmentSuccess = () => {
    setIsEditEquipmentModalOpen(false);
    setSelectedEquipmentForEdit(null);
  };

  const handleDeleteEquipment = (id: string) => {
    deleteEquipmentMutation.mutate(id);
  };

  const handleEditEquipment = (equipment: any) => {
    setSelectedEquipmentForEdit(equipment);
    setIsEditEquipmentModalOpen(true);
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeSearchTerm(e.target.value);
    setSearchTerm(sanitized);
  };

  const handleGenerateLabel = (equipment: any) => {
    setSelectedEquipmentForLabel(equipment);
  };

  const filteredEquipments = equipments?.filter(equipment => {
    // Search term filter - check if any field contains the search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        equipment.name?.toLowerCase().includes(searchLower) ||
        equipment.qr_code?.toLowerCase().includes(searchLower) ||
        equipment.client?.toLowerCase().includes(searchLower) ||
        equipment.installation_location?.toLowerCase().includes(searchLower) ||
        equipment.serial_number?.toLowerCase().includes(searchLower) ||
        equipment.model?.toLowerCase().includes(searchLower) ||
        equipment.brand?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Filter-specific checks
    if (filters.status && equipment.status !== filters.status) return false;
    if (filters.client && !equipment.client?.toLowerCase().includes(filters.client.toLowerCase())) return false;
    if (filters.installation_location && !equipment.installation_location?.toLowerCase().includes(filters.installation_location.toLowerCase())) return false;

    return true;
  });

  const hasFilters = Boolean(searchTerm) || Object.keys(filters).length > 0;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <ClientHeader />
          
          {/* Alerta de Chamados Pendentes */}
          {serviceCallsCount && serviceCallsCount > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Você tem {serviceCallsCount} chamado{serviceCallsCount > 1 ? 's' : ''} de serviço pendente{serviceCallsCount > 1 ? 's' : ''} que precisa{serviceCallsCount > 1 ? 'm' : ''} de atenção.
              </AlertDescription>
            </Alert>
          )}
          
          <EquipmentHeader onNewEquipment={() => setIsNewEquipmentModalOpen(true)} />

          <EquipmentSearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onOpenFilters={() => setIsFilterModalOpen(true)}
          />

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <EquipmentGrid
              equipments={filteredEquipments}
              isLoading={isLoading}
              hasFilters={hasFilters}
              onGenerateLabel={handleGenerateLabel}
              onDelete={handleDeleteEquipment}
              onEdit={handleEditEquipment}
              onNewEquipment={() => setIsNewEquipmentModalOpen(true)}
            />
          </div>
        </div>
      </DashboardLayout>

      <FormModal
        isOpen={isNewEquipmentModalOpen}
        onClose={() => setIsNewEquipmentModalOpen(false)}
        title="Novo Equipamento"
      >
        <NewEquipmentForm onSuccess={handleNewEquipmentSuccess} />
      </FormModal>

      <FormModal
        isOpen={isEditEquipmentModalOpen}
        onClose={() => {
          setIsEditEquipmentModalOpen(false);
          setSelectedEquipmentForEdit(null);
        }}
        title={`Editar Equipamento: ${selectedEquipmentForEdit?.name || ''}`}
      >
        {selectedEquipmentForEdit && (
          <EditEquipmentForm 
            equipment={selectedEquipmentForEdit} 
            onSuccess={handleEditEquipmentSuccess} 
          />
        )}
      </FormModal>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        type="equipments"
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {selectedEquipmentForLabel && (
        <QRCodeLabel
          equipment={selectedEquipmentForLabel}
          onClose={() => setSelectedEquipmentForLabel(null)}
        />
      )}
    </ProtectedRoute>
  );
};

export default Equipments;
