import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../layout/LoadingScreen';

/**
 * Enterprise Role-Based Route Guard
 * Intercepts rendering if the user lacks the required permission(s).
 * Accepts either a single permission string or an array of permissions.
 * If an array is provided, the user must have AT LEAST ONE of them.
 */
export default function RoleRoute({ permissions, children }) {
  const { isAuthenticated, loading, hasPermission } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
  
  // Check if user has at least one of the required permissions
  const isAuthorized = permissionArray.some(p => hasPermission(p));

  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
