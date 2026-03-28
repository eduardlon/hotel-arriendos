'use client';

import StatCard from '@/components/shared/StatCard';
import { Building2, Users, TrendingUp, AlertCircle } from 'lucide-react';
import type { Property, Tenant, Payment } from '@/types';
import { formatCurrency } from '@/lib/format';

interface RentalStatsProps {
  properties: Property[];
  tenants: Tenant[];
  payments: Payment[];
}

export default function RentalStats({ properties, tenants, payments }: RentalStatsProps) {
  const totalProperties = properties.length;
  const activeTenants = tenants.filter((tenant) => Boolean(tenant.propertyId)).length;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthPayments = payments.filter((payment) => {
    const dueDate = new Date(payment.dueDate);
    return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
  });

  const rentCollected = currentMonthPayments
    .filter((payment) => payment.status === 'pagado')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const rentPending = currentMonthPayments
    .filter((payment) => payment.status !== 'pagado')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}
    >
      <StatCard title="Propiedades" value={totalProperties} icon={Building2} />
      <StatCard title="Inquilinos Activos" value={activeTenants} icon={Users} />
      <StatCard
        title="Arriendo Cobrado"
        value={formatCurrency(rentCollected)}
        icon={TrendingUp}
      />
      <StatCard
        title="Arriendo Pendiente"
        value={formatCurrency(rentPending)}
        icon={AlertCircle}
      />
    </div>
  );
}
