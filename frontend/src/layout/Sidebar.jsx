import React from 'react';
import { X, Truck, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { SIDEBAR_GROUPS } from './navConfig';
import SidebarItem from './SidebarItem';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { logout, hasPermission } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Filter groups and items based on permissions
  const authorizedGroups = SIDEBAR_GROUPS.map(group => {
    return {
      ...group,
      items: group.items.filter(item => {
        const itemPermissions = item.permissions || ['*'];
        return itemPermissions.some(p => hasPermission(p));
      })
    };
  }).filter(group => group.items.length > 0);

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className={clsx(
          "fixed inset-0 z-30 bg-slate-900/80 backdrop-blur-sm lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 shadow-2xl border-r border-slate-800",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header / Logo */}
        <div className="h-16 flex flex-shrink-0 items-center justify-between px-6 bg-slate-950/50 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-semantic-primary to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-semantic-primary/20">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-heading">
              TransitOps
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {authorizedGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem 
                    key={item.name} 
                    item={item} 
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Area (Logout) */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/30">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-semantic-danger/10 hover:text-semantic-danger transition-colors group"
          >
            <LogOut className="w-5 h-5 text-slate-500 group-hover:text-semantic-danger transition-colors" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
