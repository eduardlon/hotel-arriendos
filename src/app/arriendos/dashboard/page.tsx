import { getProperties, getTenants, getPayments, getReminders } from '@/lib/data-access';
import RentalStats from '@/components/arriendos/RentalStats';
import Chart from '@/components/shared/Chart';
import DataTable, { type Column } from '@/components/shared/DataTable';
import { formatDate, formatCurrency } from '@/lib/format';
import type { Payment, Reminder, Tenant } from '@/types';
import styles from './page.module.css';

interface PendingPaymentRow {
  tenant: string;
  property: string;
  amount: string;
  dueDate: string;
  status: string;
}

interface ContractRow {
  tenant: string;
  property: string;
  contractEnd: string;
}

export default async function ArriendosDashboard() {
  const [properties, tenants, payments, reminders] = await Promise.all([
    getProperties(),
    getTenants(),
    getPayments(),
    getReminders(),
  ]);

  const incomeByProperty = properties
    .map((property) => {
      const total = payments
        .filter((payment) => payment.propertyId === property.id && payment.status === 'pagado')
        .reduce((sum, payment) => sum + payment.amount, 0);
      return {
        name: property.address,
        value: total,
      };
    })
    .filter((item) => item.value > 0);

  const upcomingContracts = tenants
    .filter((tenant) => tenant.contractEnd)
    .sort((a, b) => (a.contractEnd?.getTime() || 0) - (b.contractEnd?.getTime() || 0))
    .slice(0, 6)
    .map((tenant) => {
      const property = properties.find((p) => p.id === tenant.propertyId);
      return {
        tenant: tenant.name,
        property: property?.address || 'Sin propiedad',
        contractEnd: formatDate(tenant.contractEnd as Date),
      };
    });

  const pendingPayments = payments
    .filter((payment) => payment.status !== 'pagado')
    .map((payment) => {
      const tenant = tenants.find((t) => t.id === payment.tenantId);
      const property = properties.find((p) => p.id === payment.propertyId);
      return {
        tenant: tenant?.name || 'Sin asignar',
        property: property?.address || 'Sin propiedad',
        amount: formatCurrency(payment.amount),
        dueDate: formatDate(payment.dueDate),
        status: String(payment.status).toUpperCase(),
      };
    });

  const dueReminders = reminders.filter((reminder) => {
    const reminderDate = new Date(reminder.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    reminderDate.setHours(0, 0, 0, 0);
    return reminder.status === 'pendiente' && reminderDate <= today;
  });

  const pendingColumns: Column<PendingPaymentRow>[] = [
    { key: 'tenant', label: 'Inquilino' },
    { key: 'property', label: 'Propiedad' },
    { key: 'amount', label: 'Monto' },
    { key: 'dueDate', label: 'Vence' },
    { key: 'status', label: 'Estado' },
  ];

  const contractColumns: Column<ContractRow>[] = [
    { key: 'tenant', label: 'Inquilino' },
    { key: 'property', label: 'Propiedad' },
    { key: 'contractEnd', label: 'Vencimiento' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard Arriendos</h1>
        <p className={styles.subtitle}>Resumen general del negocio de arriendos</p>
      </div>

      <RentalStats properties={properties} tenants={tenants} payments={payments} />

      {dueReminders.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recordatorios urgentes</h2>
          <div className={styles.reminderList}>
            {dueReminders.map((reminder: Reminder) => (
              <div key={reminder.id} className={styles.reminderItem}>
                <strong>{reminder.description}</strong>
                <span className={styles.reminderDate}>{formatDate(reminder.date)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Ingresos por propiedad</h2>
        <Chart
          type="bar"
          data={incomeByProperty}
          config={{ xKey: 'name', yKey: 'value', height: 280, showLegend: false }}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Contratos próximos a vencer</h2>
        <DataTable
          columns={contractColumns}
          data={upcomingContracts}
          emptyMessage="No hay contratos próximos a vencer"
          itemsPerPage={6}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Pagos pendientes</h2>
        <DataTable
          columns={pendingColumns}
          data={pendingPayments}
          emptyMessage="No hay pagos pendientes"
          itemsPerPage={6}
        />
      </section>
    </div>
  );
}
