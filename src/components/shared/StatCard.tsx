'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useEffect } from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number;
}

export default function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  // Determine if value is a number for animation
  const isNumericValue = typeof value === 'number';
  const targetValue = isNumericValue ? value : 0;

  useEffect(() => {
    if (isNumericValue) {
      const controls = animate(count, targetValue, {
        duration: 1,
        ease: 'easeOut',
      });

      return controls.stop;
    }
  }, [count, targetValue, isNumericValue]);

  return (
    <motion.div
      className={styles.statCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <Icon className={styles.icon} size={24} />
        </div>
        {trend !== undefined && (
          <div className={trend >= 0 ? styles.trendPositive : styles.trendNegative}>
            {trend >= 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.value}>
          {isNumericValue ? (
            <motion.span>{rounded}</motion.span>
          ) : (
            <span>{value}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
