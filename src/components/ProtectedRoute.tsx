import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ requireAdmin = false }: ProtectedRouteProps) => {
  const { isLoaded: isClerkLoaded, userId } = useClerkAuth();
  const { profile, isProfileLoading } = useAuth();

  // 1. Se o Clerk ainda não carregou, espera
  if (!isClerkLoaded) {
    return <LoadingSpinner message="Verificando autenticação..." />;
  }

  // 2. Se o Clerk carregou e não tem usuário, manda pro login
  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  // 3. Se tem usuário mas o perfil no Supabase ainda está carregando, espera
  if (isProfileLoading) {
    return <LoadingSpinner message="Carregando perfil..." />;
  }

  // 4. Se precisa de admin e não é, manda pro dashboard comum
  if (requireAdmin && profile?.role !== 'admin') {
    return <Navigate to="/dashboard-analitico" replace />;
  }

  // 5. Se tudo ok, renderiza a página
  return <Outlet />;
};

export default ProtectedRoute;