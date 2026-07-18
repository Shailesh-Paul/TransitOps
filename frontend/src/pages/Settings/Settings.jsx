import React from 'react';
import { motion } from 'framer-motion';
import { FADE_IN } from '../../constants/animations';
import { CARD_STYLES } from '../../constants/theme';

export default function Settings() {
  return (
    <motion.div {...FADE_IN} className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-semantic-text-primary tracking-tight">System Settings</h1>
        <p className="text-semantic-text-secondary mt-1">Configure global application preferences.</p>
      </div>
      <div className={CARD_STYLES.base}>
        <div className="flex items-center justify-center h-48 text-semantic-text-secondary">
          Settings module coming soon.
        </div>
      </div>
    </motion.div>
  );
}
