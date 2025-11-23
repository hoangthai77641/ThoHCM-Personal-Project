import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import JWTContext from 'contexts/JWTContext';

interface Props {
  roles?: string[]; // restrict to roles
}

export default function ProtectedRoute({ roles }: Props) {
  const ctx = useContext(JWTContext);
  if (!ctx?.isLoggedIn) {
    return <Navigate to="/auth/login" replace />;
  }
  if (roles && roles.length > 0 && ctx.user && roles.indexOf((ctx.user as any).role) === -1) {
    return <Navigate to="/maintenance/404" replace />;
  }
  return <Outlet />;
}
