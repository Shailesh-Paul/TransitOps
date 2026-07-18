import React from 'react';
import { motion } from 'framer-motion';
import { FADE_IN } from '../constants/animations';
import Footer from './Footer';

export default function PageContainer({ children }) {
  return (
    <div className="flex flex-col flex-1 h-full min-h-[calc(100vh-4rem)]">
      <motion.main 
        {...FADE_IN} 
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}
