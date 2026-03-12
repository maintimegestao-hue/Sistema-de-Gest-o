
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from '@/components/auth/AuthProvider';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { useNavigate } from 'react-router-dom';
import FieldAccessButton from '@/components/landing/FieldAccessButton';
import ClientAccessButton from '@/components/landing/ClientAccessButton';

const LandingHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setShowAuthDialog(true);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-foreground">
              Maintime
            </span>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#recursos" className="text-muted-foreground hover:text-primary transition-colors">
              Recursos
            </a>
            <a href="#precos" className="text-muted-foreground hover:text-primary transition-colors">
              Preços
            </a>
            <a href="#contato" className="text-muted-foreground hover:text-primary transition-colors">
              Contato
            </a>
          </nav>

          {/* CTA Buttons Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <FieldAccessButton />
            <ClientAccessButton />
            {user ? (
              <>
                <Button variant="outline" onClick={() => navigate('/dashboard')} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Dashboard
                </Button>
                <Button variant="outline" onClick={handleSignOut} className="border-gray-300 text-gray-600 hover:bg-gray-100">
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleLoginClick} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Login
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setShowAuthDialog(true)}>
                  Teste Grátis 7 dias
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <a href="#recursos" className="text-muted-foreground hover:text-primary transition-colors">
                Recursos
              </a>
              <a href="#precos" className="text-muted-foreground hover:text-primary transition-colors">
                Preços
              </a>
              <a href="#contato" className="text-muted-foreground hover:text-primary transition-colors">
                Contato
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <FieldAccessButton />
                <ClientAccessButton />
                {user ? (
                  <>
                    <Button variant="outline" onClick={() => navigate('/dashboard')} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      Dashboard
                    </Button>
                    <Button variant="outline" onClick={handleSignOut} className="border-gray-300 text-gray-600 hover:bg-gray-100">
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleLoginClick} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      Login
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setShowAuthDialog(true)}>
                      Teste Grátis 7 dias
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
      
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
      />
    </header>
  );
};

export default LandingHeader;
