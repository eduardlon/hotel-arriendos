'use client';

import DataTable, { type Column, type Filter } from '@/components/shared/DataTable';
import type { Payment, Tenant, Property } from '@/types';
import { formatCurrency, formatDate } from '@/lib/format';
import styles from './PaymentTable.module.css';

interface PaymentTableProps {
  payments: Payment[];
  tenants: Tenant[];
  properties: Property[];
  onGenerateReceipt?: (payment: Payment) => void;
}

interface PaymentRow {
  id: string;
  tenant: string;
  property: string;
  amount: number;
  dueDate: Date;
  status: Payment['status'];
  propertyId: string;
  raw: Payment;
}

export default function PaymentTable({
  payments,
  tenants,
  properties,
  onGenerateReceipt,
}: PaymentTableProps) {
  const rows: PaymentRow[] = payments.map((payment) => {
    const tenant = tenants.find((t) => t.id === payment.tenantId);
    const property = properties.find((p) => p.id === payment.propertyId);

    return {
      id: payment.id,
      tenant: tenant?.name || 'Sin asignar',
      property: property?.address || 'Sin propiedad',
      amount: payment.amount,
      dueDate: payment.dueDate,
      status: payment.status,
      propertyId: payment.propertyId,
      raw: payment,
    };
  });

  const columns: Column<PaymentRow>[] = [
    { key: 'tenant', label: 'Inquilino' },
    { key: 'property', label: 'Propiedad' },
    {
      key: 'amount',
      label: 'Monto',
      render: (value) => formatCurrency(Number(value)),
    },
    {
      key: 'dueDate',
      label: 'Fecha',
      render: (value) => formatDate(value as Date),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value) => {
        if (value === 'pagado') {
          return <span className={`${styles.badge} ${styles.badgePaid}`}>Pagado</span>;
        }
        if (value === 'vencido') {
          return <span className={`${styles.badge} ${styles.badgeOverdue}`}>Vencido</span>;
        }
        return <span className={`${styles.badge} ${styles.badgePending}`}>Pendiente</span>;
      },
    },
    {
      key: 'actions',
      label: 'Acciones',
      sortable: false,
      render: (_value, row) => (
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => onGenerateReceipt?.(row.raw)}
        >
          Recibo
        </button>
      ),
    },
  ];

  const filters: Filter[] = [
    {
      key: 'status',
      label: 'Estado',
      options: [
        { value: 'pagado', label: 'Pagado' },
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'vencido', label: 'Vencido' },
      ],
    },
    {
      key: 'propertyId',
      label: 'Propiedad',
      options: properties.map((property) => ({
        value: property.id,
        label: property.address,
      })),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      filters={filters}
      emptyMessage="No hay pagos registrados"
    />
  );
}
