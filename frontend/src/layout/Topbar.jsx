import React from 'react';
import { Menu } from 'lucide-react';
import Breadcrumb from './Breadcrumb';
import SearchBar from './SearchBar';
import NotificationBell from './NotificationBell';
import UserMenu from './UserMenu';

export default function Topbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-white/5 bg-surface/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-slate-400 lg:hidden hover:text-white hover:bg-white/5 rounded-md transition-colors"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator for mobile */}
      <div className="h-6 w-px bg-white/10 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center justify-between">
        <div className="flex flex-1 items-center gap-x-6">
          <Breadcrumb />
          <SearchBar />
        </div>
        
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <NotificationBell />
          
          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-white/10" aria-hidden="true" />
          
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
