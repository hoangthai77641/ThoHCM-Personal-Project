import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import JWTContext from 'contexts/JWTContext';

export default function ProtectedRoute() {
  const ctx = useContext(JWTContext);
  if (!ctx?.isLoggedIn) {
    return <Navigate to="/auth/login" replace />;
  }
  return <Outlet />;
}
