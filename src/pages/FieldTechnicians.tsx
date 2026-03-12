import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus } from 'lucide-react';
import NewFieldTechnicianForm from '@/components/forms/NewFieldTechnicianForm';
import FieldTechniciansTable from '@/components/field/FieldTechniciansTable';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import AccessDenied from '@/components/common/AccessDenied';

const FieldTechnicians = () => {
  const [showNewForm, setShowNewForm] = useState(false);
  const { isAdmin, isLoading } = useAdminAccess();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <AccessDenied />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Técnicos de Campo</h1>
          </div>
          <Button onClick={() => setShowNewForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Técnico
          </Button>
        </div>

        {showNewForm ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Adicionar Novo Técnico</h2>
              <Button variant="outline" onClick={() => setShowNewForm(false)}>
                Voltar à Lista
              </Button>
            </div>
            <NewFieldTechnicianForm onSuccess={() => setShowNewForm(false)} />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Técnicos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldTechniciansTable />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FieldTechnicians;