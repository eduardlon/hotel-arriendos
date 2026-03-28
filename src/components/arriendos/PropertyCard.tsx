'use client';

import type { Property } from '@/types';
import styles from './PropertyCard.module.css';

interface PropertyCardProps {
  property: Property;
  onEdit?: (property: Property) => void;
  onDetails?: (property: Property) => void;
}

const statusLabelMap: Record<Property['status'], string> = {
  disponible: 'Disponible',
  ocupada: 'Ocupada',
  mantenimiento: 'Mantenimiento',
};

const statusClassMap: Record<Property['status'], string> = {
  disponible: styles.statusDisponible,
  ocupada: styles.statusOcupada,
  mantenimiento: styles.statusMantenimiento,
};

export default function PropertyCard({ property, onEdit, onDetails }: PropertyCardProps) {
  const initials = property.address
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={styles.card}
      onClick={() => onEdit?.(property)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onEdit?.(property);
        }
      }}
    >
      {property.image ? (
        <div
          className={styles.image}
          style={{ backgroundImage: `url(${property.image})` }}
          aria-label={`Imagen de ${property.address}`}
        />
      ) : (
        <div className={styles.placeholder} aria-label="Sin imagen">
          {initials}
        </div>
      )}
      <div className={styles.content}>
        <span className={styles.address}>{property.address}</span>
        <div className={styles.meta}>
          <span className={styles.type}>{property.type}</span>
          <span className={`${styles.status} ${statusClassMap[property.status]}`}>
            {statusLabelMap[property.status]}
          </span>
        </div>
        <div className={styles.actions} onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.primaryButton}`}
            onClick={() => onEdit?.(property)}
          >
            Editar
          </button>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => onDetails?.(property)}
          >
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );
}
