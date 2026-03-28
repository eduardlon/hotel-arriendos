'use client';

import type { Tenant, Property } from '@/types';
import { formatDate } from '@/lib/format';
import styles from './TenantCard.module.css';

interface TenantCardProps {
  tenant: Tenant;
  property?: Property;
  onEdit?: (tenant: Tenant) => void;
  onDetails?: (tenant: Tenant) => void;
}

export default function TenantCard({ tenant, property, onEdit, onDetails }: TenantCardProps) {
  const contractStart = tenant.contractStart ? formatDate(tenant.contractStart) : '-';
  const contractEnd = tenant.contractEnd ? formatDate(tenant.contractEnd) : '-';

  return (
    <tr className={styles.row}>
      <td className={`${styles.cell} ${styles.name}`}>{tenant.name}</td>
      <td className={styles.cell}>{tenant.phone}</td>
      <td className={styles.cell}>{tenant.email}</td>
      <td className={styles.cell}>{property?.address || 'Sin asignar'}</td>
      <td className={styles.cell}>{contractStart}</td>
      <td className={styles.cell}>{contractEnd}</td>
      <td className={styles.cell}>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.primaryButton}`}
            onClick={() => onEdit?.(tenant)}
          >
            Editar
          </button>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => onDetails?.(tenant)}
          >
            Ver
          </button>
        </div>
      </td>
    </tr>
  );
}
