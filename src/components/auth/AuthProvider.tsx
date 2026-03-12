
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Security utility functions for input sanitization
const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .substring(0, 1000); // Limit length
};

const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'number' && isFinite(value)) {
      sanitized[key] = value;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (value === null || value === undefined) {
      sanitized[key] = value;
    }
    // Skip other types for security
  }
  return sanitized;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider initializing...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event, session ? 'authenticated' : 'not authenticated');
        if (session?.user) {
          console.log('👤 User logged in:', session.user.email);
        }
        
        // Create profile and trial subscription for new users
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              // 1. Criar perfil como admin (com limitações de trial)
              const { error: profileError } = await supabase
                .from('user_profiles')
                .upsert({
                  user_id: session.user.id,
                  full_name: session.user.user_metadata?.full_name || '',
                  role: 'admin' // Admin mas limitado ao plano básico durante trial
                }, {
                  onConflict: 'user_id',
                  ignoreDuplicates: true
                });
              
              if (profileError && profileError.code !== '23505') {
                console.error('❌ Error creating user profile:', profileError);
              }

              // 2. Verificar se já tem subscriber entry
              const { data: existingSubscriber } = await supabase
                .from('subscribers')
                .select('id')
                .eq('user_id', session.user.id)
                .single();

              // 3. Se não tem subscriber, criar trial de 7 dias
              if (!existingSubscriber) {
                const { error: subscriberError } = await supabase
                  .from('subscribers')
                  .insert({
                    user_id: session.user.id,
                    email: session.user.email,
                    subscribed: false,
                    subscription_tier: 'basic', // Plano básico durante trial
                    trial_start: new Date().toISOString(),
                    trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    trial_expired: false,
                    days_remaining: 7
                  });

                if (subscriberError) {
                  console.error('❌ Error creating subscriber:', subscriberError);
                } else {
                  console.log('✅ Trial de 7 dias criado para novo usuário');
                }
              }
            } catch (error) {
              console.error('❌ Error in auth setup:', error);
            }
          }, 100);
        }
        
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Error getting initial session:', error);
      } else {
        console.log('👤 Initial session:', session?.user?.id ? 'authenticated' : 'not authenticated');
        if (session?.user) {
          console.log('👤 Restoring session for:', session.user.email);
        }
      }
      
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const sanitizedEmail = sanitizeString(email);
    const sanitizedPassword = password; // Don't sanitize passwords, just validate format
    
    if (!sanitizedEmail || !sanitizedPassword) {
      throw new Error('Email e senha são obrigatórios');
    }
    
    if (!sanitizedEmail.includes('@')) {
      throw new Error('Email inválido');
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password: sanitizedPassword,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const sanitizedEmail = sanitizeString(email);
    const sanitizedPassword = password; // Don't sanitize passwords
    
    if (!sanitizedEmail || !sanitizedPassword) {
      throw new Error('Email e senha são obrigatórios');
    }
    
    if (!sanitizedEmail.includes('@')) {
      throw new Error('Email inválido');
    }
    
    if (sanitizedPassword.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }
    
    const { error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password: sanitizedPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export sanitization utilities for use in other components
export { sanitizeString, sanitizeObject };
