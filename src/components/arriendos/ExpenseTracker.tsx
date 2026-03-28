'use client';

import { useMemo } from 'react';
import type { Expense, Property } from '@/types';
import Chart from '@/components/shared/Chart';
import DataTable, { type Column } from '@/components/shared/DataTable';
import { formatCurrency, formatDate } from '@/lib/format';
import styles from './ExpenseTracker.module.css';

interface ExpenseTrackerProps {
  expenses: Expense[];
  properties: Property[];
  propertyId?: string;
}

interface ExpenseRow {
  id: string;
  property: string;
  amount: number;
  category: Expense['category'];
  date: Date;
  description: string;
}

export default function ExpenseTracker({ expenses, properties, propertyId }: ExpenseTrackerProps) {
  const visibleExpenses = useMemo(() => {
    if (!propertyId) return expenses;
    return expenses.filter((expense) => expense.propertyId === propertyId);
  }, [expenses, propertyId]);

  const expenseRows: ExpenseRow[] = visibleExpenses.map((expense) => {
    const property = properties.find((p) => p.id === expense.propertyId);
    return {
      id: expense.id,
      property: property?.address || 'Sin propiedad',
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      description: expense.description,
    };
  });

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    visibleExpenses.forEach((expense) => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return totals;
  }, [visibleExpenses]);

  const chartData = Object.entries(categoryTotals).map(([category, total]) => ({
    name: category,
    value: total,
  }));

  const totalExpenses = visibleExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const columns: Column<ExpenseRow>[] = [
    { key: 'property', label: 'Propiedad' },
    {
      key: 'amount',
      label: 'Monto',
      render: (value) => formatCurrency(Number(value)),
    },
    {
      key: 'category',
      label: 'Categoría',
      render: (value) => String(value).toUpperCase(),
    },
    {
      key: 'date',
      label: 'Fecha',
      render: (value) => formatDate(value as Date),
    },
    { key: 'description', label: 'Descripción' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryTitle}>Total de gastos</div>
          <div className={styles.summaryValue}>{formatCurrency(totalExpenses)}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryTitle}>Cantidad de gastos</div>
          <div className={styles.summaryValue}>{visibleExpenses.length}</div>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h3>Gastos por categoría</h3>
        <Chart
          type="pie"
          data={chartData}
          config={{
            dataKey: 'value',
            nameKey: 'name',
            height: 260,
            showLegend: true,
            showTooltip: true,
          }}
        />
      </div>

      <div className={styles.tableSection}>
        <h3>Historial de gastos</h3>
        <DataTable
          columns={columns}
          data={expenseRows}
          emptyMessage="No hay gastos registrados"
        />
      </div>
    </div>
  );
}

