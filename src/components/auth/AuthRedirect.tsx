import { useAuth } from './AuthProvider';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Component to redirect authenticated users
export const AuthRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      console.log('👤 User authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return null;
};