import React from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotificationBell() {
  return (
    <button className="relative p-2 text-semantic-text-secondary hover:text-semantic-text-primary transition-colors rounded-full hover:bg-slate-100">
      <Bell className="w-5 h-5" />
      <motion.span 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1.5 right-1.5 w-2 h-2 bg-semantic-danger rounded-full border border-white"
      />
    </button>
  );
}
