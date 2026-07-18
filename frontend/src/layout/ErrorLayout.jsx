import React from 'react';
import { Outlet } from 'react-router-dom';

export default function ErrorLayout() {
  return (
    <div className="min-h-screen bg-semantic-background flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-semantic-danger/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-semantic-warning/10 rounded-full blur-[120px]"></div>
      </div>
      <div className="z-10 w-full max-w-2xl text-center">
        <Outlet />
      </div>
    </div>
  );
}
