import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function SidebarItem({ item, isCollapsed, onClick }) {
  const Icon = item.icon;
  
  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) => 
        `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group overflow-hidden ${
          isActive 
            ? 'text-semantic-primary bg-semantic-primary/10' 
            : 'text-semantic-text-secondary hover:bg-slate-800 hover:text-slate-100'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="activeSidebarIndicator"
              className="absolute left-0 top-0 bottom-0 w-1 bg-semantic-primary rounded-r-full"
              initial={false}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-semantic-primary' : ''}`} />
          {!isCollapsed && (
            <span className="truncate">{item.name}</span>
          )}
        </>
      )}
    </NavLink>
  );
}
