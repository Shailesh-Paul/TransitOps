import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts & Guards
import AuthLayout from '../layout/AuthLayout';
import AppLayout from '../layout/AppLayout';
import ErrorLayout from '../layout/ErrorLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import LoadingScreen from '../layout/LoadingScreen';

// Config
import { publicRoutes, privateRoutes } from './config';

// Fallback / Loading
import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        
        {/* PUBLIC ROUTES */}
        <Route element={<AuthLayout />}>
          {publicRoutes.map((route) => {
            const Element = route.element;
            return <Route key={route.path} path={route.path} element={<Element />} />;
          })}
        </Route>

        {/* PRIVATE ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {privateRoutes.map((route) => {
              const Element = route.element;
              return (
                <Route 
                  key={route.path} 
                  path={route.path} 
                  element={
                    <RoleRoute permissions={route.permissions}>
                      <Element />
                    </RoleRoute>
                  } 
                />
              );
            })}
          </Route>
        </Route>

        {/* ERROR ROUTES */}
        <Route element={<ErrorLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>

      </Routes>
    </Suspense>
  );
}
