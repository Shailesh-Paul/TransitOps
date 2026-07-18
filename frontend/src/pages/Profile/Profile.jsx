import React from 'react';
import { motion } from 'framer-motion';
import { FADE_IN } from '../../constants/animations';
import { CARD_STYLES } from '../../constants/theme';

export default function Profile() {
  return (
    <motion.div {...FADE_IN} className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-semantic-text-primary tracking-tight">User Profile</h1>
        <p className="text-semantic-text-secondary mt-1">Manage your account and preferences.</p>
      </div>
      <div className={CARD_STYLES.base}>
        <div className="flex items-center justify-center h-48 text-semantic-text-secondary">
          Profile management coming soon.
        </div>
      </div>
    </motion.div>
  );
}
