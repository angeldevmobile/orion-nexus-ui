import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast({
        title: 'Error en autenticación',
        description: 'No se pudo completar el inicio de sesión con GitHub',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      login();
      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión exitosamente con GitHub',
      });
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  }, [searchParams, navigate, login, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Autenticando con GitHub...</p>
      </div>
    </div>
  );
}