
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SidebarUserProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Erro ao fazer logout. Tente novamente.');
    }
  };

  if (!user) return null;

  return (
    <div className="border-t border-gray-200 p-4 mt-auto">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-evolutec-green rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-evolutec-black truncate">
            {user.email}
          </p>
          <p className="text-xs text-evolutec-text">
            Usuário Admin
          </p>
        </div>
      </div>
      
      <Button
        onClick={handleSignOut}
        variant="outline"
        size="sm"
        className="w-full justify-start text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sair da Conta
      </Button>
    </div>
  );
};

export default SidebarUserProfile;
