import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Eye, EyeOff, Copy, Trash2, UserX, UserCheck } from 'lucide-react';
import { useFieldTechnicians, useUpdateFieldTechnician, useDeleteFieldTechnician, type FieldTechnician } from '@/hooks/useFieldTechnicians';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const FieldTechniciansTable: React.FC = () => {
  const { data: technicians, isLoading } = useFieldTechnicians();
  const updateTechnician = useUpdateFieldTechnician();
  const deleteTechnician = useDeleteFieldTechnician();
  const { toast } = useToast();
  
  const [showAccessCode, setShowAccessCode] = useState<{ [key: string]: boolean }>({});
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; technician?: FieldTechnician }>({ open: false });

  const copyAccessCode = (accessCode: string, name: string) => {
    navigator.clipboard.writeText(accessCode);
    toast({
      title: 'Copiado!',
      description: `Código de acesso de ${name} copiado para a área de transferência.`,
    });
  };

  const toggleAccessCodeVisibility = (technicianId: string) => {
    setShowAccessCode(prev => ({
      ...prev,
      [technicianId]: !prev[technicianId]
    }));
  };

  const toggleTechnicianStatus = async (technician: FieldTechnician) => {
    try {
      await updateTechnician.mutateAsync({
        id: technician.id,
        technicianData: { is_active: !technician.is_active }
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.technician) return;
    
    try {
      await deleteTechnician.mutateAsync(deleteDialog.technician.id);
      setDeleteDialog({ open: false });
    } catch (error) {
      console.error('Erro ao excluir técnico:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Carregando técnicos...</div>;
  }

  if (!technicians || technicians.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Nenhum técnico de campo cadastrado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Código de Acesso</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-[50px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {technicians.map((technician) => (
              <TableRow key={technician.id}>
                <TableCell className="font-medium">{technician.name}</TableCell>
                <TableCell>{technician.email}</TableCell>
                <TableCell>{technician.phone || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input
                      type={showAccessCode[technician.id] ? "text" : "password"}
                      value={technician.access_code}
                      readOnly
                      className="w-32 font-mono text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAccessCodeVisibility(technician.id)}
                    >
                      {showAccessCode[technician.id] ? 
                        <EyeOff className="w-3 h-3" /> : 
                        <Eye className="w-3 h-3" />
                      }
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyAccessCode(technician.access_code, technician.name)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={technician.is_active ? 'default' : 'secondary'}>
                    {technician.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(technician.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => toggleTechnicianStatus(technician)}
                      >
                        {technician.is_active ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteDialog({ open: true, technician })}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o técnico "{deleteDialog.technician?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FieldTechniciansTable;