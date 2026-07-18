import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PageContainer from './PageContainer';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-semantic-background overflow-hidden text-semantic-text-primary antialiased font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
          <PageContainer>
            <Outlet />
          </PageContainer>
        </div>
      </div>
    </div>
  );
}
