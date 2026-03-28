'use client';

import { motion } from 'framer-motion';
import { User, Clock, Briefcase } from 'lucide-react';
import type { Employee } from '@/types';
import styles from './EmployeeCard.module.css';

interface EmployeeCardProps {
  employee: Employee;
  onClick?: () => void;
}

export default function EmployeeCard({ employee, onClick }: EmployeeCardProps) {
  // Map role to Spanish display text
  const roleLabels: Record<Employee['role'], string> = {
    recepcionista: 'Recepcionista',
    limpieza: 'Limpieza',
    mantenimiento: 'Mantenimiento',
    gerente: 'Gerente',
  };

  // Map shift to Spanish display text
  const shiftLabels: Record<Employee['shift'], string> = {
    mañana: 'Mañana',
    tarde: 'Tarde',
    noche: 'Noche',
  };

  return (
    <motion.div
      className={styles.employeeCard}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={styles.photoContainer}>
        {employee.photo ? (
          <img
            src={employee.photo}
            alt={employee.name}
            className={styles.photo}
          />
        ) : (
          <div className={styles.photoPlaceholder}>
            <User size={32} />
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{employee.name}</h3>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <Briefcase className={styles.icon} size={16} />
            <span className={styles.detailText}>{roleLabels[employee.role]}</span>
          </div>

          <div className={styles.detailRow}>
            <Clock className={styles.icon} size={16} />
            <span className={styles.detailText}>{shiftLabels[employee.shift]}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
