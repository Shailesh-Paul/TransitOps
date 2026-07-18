import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle } from 'react-icons/fi';
import { ROUTES } from '../constants/routes';
import { BUTTON_VARIANTS } from '../constants/theme';
import { motion } from 'framer-motion';
import { FADE_IN } from '../constants/animations';

export default function NotFound() {
  return (
    <motion.div {...FADE_IN} className="flex flex-col items-center space-y-6">
      <div className="w-24 h-24 bg-semantic-danger/20 text-semantic-danger rounded-full flex items-center justify-center border border-semantic-danger/30 shadow-[0_0_30px_rgba(248,113,113,0.2)]">
        <FiAlertTriangle className="w-12 h-12" />
      </div>
      <h1 className="text-5xl font-extrabold text-semantic-text-primary tracking-tight font-heading">
        404
      </h1>
      <p className="text-xl text-semantic-text-secondary max-w-md mx-auto">
        The system resource you're looking for could not be located.
      </p>
      <div className="pt-4">
        <Link to={ROUTES.DASHBOARD} className={BUTTON_VARIANTS.primary}>
          Return to Dashboard
        </Link>
      </div>
    </motion.div>
  );
}
