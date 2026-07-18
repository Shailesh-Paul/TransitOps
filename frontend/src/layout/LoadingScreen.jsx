import React from 'react';
import { Truck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="flex flex-col h-[60vh] items-center justify-center space-y-6">
      <motion.div 
        animate={{ 
          y: [0, -10, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-16 h-16 bg-gradient-to-br from-semantic-primary to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-semantic-primary/20"
      >
        <Truck className="w-8 h-8 text-white" />
      </motion.div>
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold text-semantic-text-primary">Loading Workspace</h3>
        <p className="text-sm text-semantic-text-secondary mt-1">Please wait while we gather your data...</p>
      </div>
      <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-semantic-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
    </div>
  );
}
