'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import DataTable, { Column } from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import StatCard from '@/components/shared/StatCard';
import { getHotelTransactions, createHotelTransaction, isCachePrimed } from '@/lib/data-access';
import type { HotelTransaction } from '@/types';
import { formatCurrency, formatDate, formatMonthYear } from '@/lib/format';
import { useToast } from '@/components/shared/Toast';
import styles from './page.module.css';

export default function FinanzasPage() {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<HotelTransaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasCache = useMemo(() => isCachePrimed('hotelTransactions'), []);
  const [loading, setLoading] = useState(!hasCache);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    type: 'ingreso' as 'ingreso' | 'gasto',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    const loadTransactions = async () => {
      if (!hasCache) {
        setLoading(true);
      }
      try {
        const data = await getHotelTransactions();
        if (!active) return;
        setTransactions(data);
      } catch (error) {
        addToast('No se pudieron cargar las transacciones.', 'error');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadTransactions();
    return () => {
      active = false;
    };
  }, [addToast, hasCache]);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((t) => new Date(t.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter((t) => new Date(t.date) <= end);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, startDate, endDate]);

  // Calculate monthly totals
  const monthlyTotals = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const income = monthlyTransactions
      .filter((t) => t.type === 'ingreso')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthlyTransactions
      .filter((t) => t.type === 'gasto')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expenses, net: income - expenses };
  }, [transactions]);

  // Prepare chart data for income vs expenses by month
  const chartData = useMemo(() => {
    const monthlyData: Record<string, { income: number; expenses: number }> = {};

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }

      if (t.type === 'ingreso') {
        monthlyData[monthKey].income += t.amount;
      } else {
        monthlyData[monthKey].expenses += t.amount;
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, data]) => ({
        name: formatMonthYear(new Date(month + '-01')),
        Ingresos: data.income,
        Gastos: data.expenses,
      }));
  }, [transactions]);

  // Table columns
  const columns: Column<HotelTransaction>[] = [
    {
      key: 'date',
      label: 'Fecha',
      render: (value) => formatDate(value),
    },
    {
      key: 'type',
      label: 'Tipo',
      render: (value) => (
        <span className={value === 'ingreso' ? styles.badgeIncome : styles.badgeExpense}>
          {value === 'ingreso' ? 'Ingreso' : 'Gasto'}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Categoría',
    },
    {
      key: 'description',
      label: 'Descripción',
    },
    {
      key: 'amount',
      label: 'Monto',
      render: (value) => formatCurrency(Number(value)),
    },
  ];

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'El monto debe ser mayor que cero';
    }

    if (!formData.category.trim()) {
      errors.category = 'La categoría es obligatoria';
    }

    if (!formData.date) {
      errors.date = 'La fecha es obligatoria';
    }

    if (!formData.description.trim()) {
      errors.description = 'La descripción es obligatoria';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const newTransaction = await createHotelTransaction({
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: new Date(formData.date),
        description: formData.description,
      });

      setTransactions([newTransaction, ...transactions]);
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      addToast('No se pudo registrar la transacción.', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'ingreso',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setFormErrors({});
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Cargando datos financieros...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Finanzas del Hotel</h1>
          <p className={styles.subtitle}>Gestión de ingresos y gastos</p>
        </div>
        <button className={styles.addButton} onClick={handleOpenModal}>
          <Plus size={20} />
          Registrar Transacción
        </button>
      </div>

      {/* Monthly Stats */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Ingresos del Mes"
          value={formatCurrency(monthlyTotals.income)}
          icon={TrendingUp}
          trend={0}
        />
        <StatCard
          title="Gastos del Mes"
          value={formatCurrency(monthlyTotals.expenses)}
          icon={TrendingDown}
          trend={0}
        />
        <StatCard
          title="Balance Neto"
          value={formatCurrency(monthlyTotals.net)}
          icon={DollarSign}
          trend={0}
        />
      </div>

      {/* Income vs Expenses Chart */}
      <motion.div
        className={styles.chartSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2 className={styles.sectionTitle}>Ingresos vs Gastos Mensuales</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
            <XAxis
              dataKey="name"
              stroke="var(--color-gray-600)"
              style={{ fontSize: 'var(--font-size-sm)' }}
            />
            <YAxis
              stroke="var(--color-gray-600)"
              style={{ fontSize: 'var(--font-size-sm)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 'var(--border-radius-md)',
                padding: 'var(--spacing-2)',
              }}
              formatter={(value: any) => formatCurrency(Number(value))}
            />
            <Legend wrapperStyle={{ fontSize: 'var(--font-size-sm)' }} />
            <Bar dataKey="Ingresos" fill="var(--color-green-accent)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Gastos" fill="var(--color-status-error)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Date Filters */}
      <motion.div
        className={styles.filtersSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h2 className={styles.sectionTitle}>Historial de Transacciones</h2>
        <div className={styles.dateFilters}>
          <div className={styles.filterGroup}>
            <label htmlFor="startDate" className={styles.filterLabel}>
              <Calendar size={16} />
              Desde
            </label>
            <input
              type="date"
              id="startDate"
              className={styles.dateInput}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
            <label htmlFor="endDate" className={styles.filterLabel}>
              <Calendar size={16} />
              Hasta
            </label>
            <input
              type="date"
              id="endDate"
              className={styles.dateInput}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {(startDate || endDate) && (
            <button
              className={styles.clearButton}
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        className={styles.tableSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <DataTable
          columns={columns}
          data={filteredTransactions}
          emptyMessage="No hay transacciones registradas"
        />
      </motion.div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Transacción"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="type" className={styles.label}>
              Tipo de Transacción
            </label>
            <select
              id="type"
              className={styles.select}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'ingreso' | 'gasto' })}
            >
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount" className={styles.label}>
              Monto *
            </label>
            <input
              type="number"
              id="amount"
              className={`${styles.input} ${formErrors.amount ? styles.inputError : ''}`}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Ej: 50000"
              min="0"
              step="1"
            />
            {formErrors.amount && <span className={styles.errorText}>{formErrors.amount}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Categoría *
            </label>
            <input
              type="text"
              id="category"
              className={`${styles.input} ${formErrors.category ? styles.inputError : ''}`}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Ej: Hospedaje, Servicios básicos, Mantenimiento"
            />
            {formErrors.category && <span className={styles.errorText}>{formErrors.category}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date" className={styles.label}>
              Fecha *
            </label>
            <input
              type="date"
              id="date"
              className={`${styles.input} ${formErrors.date ? styles.inputError : ''}`}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            {formErrors.date && <span className={styles.errorText}>{formErrors.date}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Descripción *
            </label>
            <textarea
              id="description"
              className={`${styles.textarea} ${formErrors.description ? styles.inputError : ''}`}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe la transacción"
              rows={3}
            />
            {formErrors.description && <span className={styles.errorText}>{formErrors.description}</span>}
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              Guardar Transacción
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

