import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { privateRoutes } from '../routes/config';
import { ROUTES } from '../constants/routes';

export default function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Fallback if we can't find a matching route in config
  let currentBreadcrumb = 'Overview';
  const matchingRoute = privateRoutes.find(r => r.path === location.pathname);
  
  if (matchingRoute && matchingRoute.breadcrumb) {
    currentBreadcrumb = matchingRoute.breadcrumb;
  } else if (pathnames.length > 0) {
    // Basic capitalization for unknown nested routes
    const last = pathnames[pathnames.length - 1];
    currentBreadcrumb = last.charAt(0).toUpperCase() + last.slice(1);
  }

  return (
    <nav className="flex items-center space-x-1 text-sm font-medium text-semantic-text-secondary">
      <Link to={ROUTES.DASHBOARD} className="hover:text-semantic-text-primary transition-colors flex items-center">
        <Home className="w-4 h-4" />
      </Link>
      
      {pathnames.length > 0 && (
        <ChevronRight className="w-4 h-4 opacity-50" />
      )}
      
      <span className="text-semantic-text-primary">
        {currentBreadcrumb}
      </span>
    </nav>
  );
}
