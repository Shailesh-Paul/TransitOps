import React, { useState, useRef, useEffect } from 'react';
import { UserCircle, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-semantic-primary/10 text-semantic-primary flex items-center justify-center border border-semantic-primary/20">
          <UserCircle className="w-5 h-5" />
        </div>
        <div className="hidden md:flex flex-col items-start text-left">
          <span className="text-sm font-semibold text-semantic-text-primary leading-none">Enterprise User</span>
          <span className="text-xs text-semantic-text-secondary mt-1">Fleet Manager</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-modal border border-slate-100 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <p className="text-sm font-medium text-semantic-text-primary">Enterprise User</p>
              <p className="text-xs text-semantic-text-secondary truncate">admin@transitops.com</p>
            </div>
            <div className="p-1">
              <button 
                onClick={() => { setIsOpen(false); navigate(ROUTES.PROFILE); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-semantic-text-secondary hover:text-semantic-text-primary hover:bg-slate-50 rounded-md transition-colors"
              >
                <UserCircle className="w-4 h-4" /> Profile
              </button>
              <button 
                onClick={() => { setIsOpen(false); navigate(ROUTES.SETTINGS); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-semantic-text-secondary hover:text-semantic-text-primary hover:bg-slate-50 rounded-md transition-colors"
              >
                <Settings className="w-4 h-4" /> System Settings
              </button>
            </div>
            <div className="p-1 border-t border-slate-100">
              <button 
                onClick={() => { setIsOpen(false); navigate(ROUTES.LOGIN); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-semantic-danger hover:bg-semantic-danger/10 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
