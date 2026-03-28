'use client';

import { motion } from 'framer-motion';
import { Bed, MapPin, DollarSign } from 'lucide-react';
import type { Room } from '@/types';
import styles from './RoomCard.module.css';
import { formatCurrency } from '@/lib/format';

interface RoomCardProps {
  room: Room;
  onClick?: () => void;
}

export default function RoomCard({ room, onClick }: RoomCardProps) {
  // Map room type to Spanish display text
  const roomTypeLabels: Record<Room['type'], string> = {
    individual: 'Individual',
    doble: 'Doble',
    suite: 'Suite',
    familiar: 'Familiar',
  };

  // Map status to CSS class for color coding
  const statusClass = `status-${room.status}`;

  return (
    <motion.div
      className={`${styles.roomCard} ${styles[statusClass]}`}
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
      <div className={styles.header}>
        <div className={styles.roomNumber}>
          <Bed className={styles.icon} size={20} />
          <span className={styles.number}>{room.number}</span>
        </div>
        <div className={`${styles.statusBadge} ${styles[statusClass]}`}>
          {room.status}
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailRow}>
          <MapPin className={styles.detailIcon} size={16} />
          <span className={styles.detailText}>
            {roomTypeLabels[room.type]} - Piso {room.floor}
          </span>
        </div>

        <div className={styles.detailRow}>
          <DollarSign className={styles.detailIcon} size={16} />
          <span className={styles.detailText}>
            {formatCurrency(room.price)} / noche
          </span>
        </div>
      </div>
    </motion.div>
  );
}
