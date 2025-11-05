import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, user, requiredRole }) {
  const token = localStorage.getItem('token');
  
  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // If user is not loaded yet, show nothing (loading state)
  if (!user) {
    return null;
  }
  
  // If a specific role is required and user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}
