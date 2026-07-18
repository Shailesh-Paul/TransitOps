import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export default function AuthLayout() {
  const location = useLocation();

  // The Login page has its own custom full-screen split design.
  // We bypass the generic auth wrapper for it.
  if (location.pathname === ROUTES.LOGIN || location.pathname === '/login') {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-semantic-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-semantic-text-primary cyber-lime-glow">
          TransitOps
        </h2>
        <p className="mt-2 text-center text-sm text-semantic-text-secondary">
          Enterprise Fleet Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-8 px-4 sm:rounded-lg sm:px-10 shadow-modal">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
