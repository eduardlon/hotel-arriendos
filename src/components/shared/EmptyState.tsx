'use client';

import { motion } from 'framer-motion';
import { LucideIcon, HelpCircle } from 'lucide-react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  message: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ message, icon: Icon = HelpCircle, action }: EmptyStateProps) {
  return (
    <motion.div
      className={styles.emptyState}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className={styles.iconWrapper}>
        <Icon className={styles.icon} size={48} />
      </div>
      
      <p className={styles.message}>{message}</p>
      
      {action && (
        <button
          className={styles.actionButton}
          onClick={action.onClick}
          type="button"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
