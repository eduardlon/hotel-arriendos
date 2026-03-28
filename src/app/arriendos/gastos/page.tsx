'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Expense, Property } from '@/types';
import { getExpenses, createExpense, getProperties, isCachePrimed } from '@/lib/data-access';
import ExpenseTracker from '@/components/arriendos/ExpenseTracker';
import Modal from '@/components/shared/Modal';
import { useToast } from '@/components/shared/Toast';
import styles from './page.module.css';

export default function GastosPage() {
  const { addToast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const hasCache = useMemo(() => isCachePrimed('expenses', 'properties'), []);
  const [loading, setLoading] = useState(!hasCache);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [formData, setFormData] = useState({
    propertyId: '',
    amount: '',
    category: 'reparaciones' as Expense['category'],
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (!hasCache) {
        setLoading(true);
      }
      try {
        const [expensesData, propertiesData] = await Promise.all([
          getExpenses(),
          getProperties(),
        ]);
        if (!active) return;
        setExpenses(expensesData);
        setProperties(propertiesData);
      } catch (error) {
        addToast('No se pudieron cargar los gastos.', 'error');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [addToast, hasCache]);

  const openModal = () => {
    setFormData({
      propertyId: '',
      amount: '',
      category: 'reparaciones',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.propertyId) {
      newErrors.propertyId = 'Seleccione una propiedad';
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor que cero';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const expensePayload: Omit<Expense, 'id'> = {
      propertyId: formData.propertyId,
      amount: Number(formData.amount),
      category: formData.category,
      date: new Date(formData.date),
      description: formData.description.trim(),
    };

    const tempId = `exp-temp-${Date.now()}`;
    const optimisticExpense: Expense = { id: tempId, ...expensePayload };
    const previousState = [...expenses];
    setExpenses((prev) => [optimisticExpense, ...prev]);
    setIsModalOpen(false);

    try {
      const created = await createExpense(expensePayload);
      setExpenses((prev) => prev.map((expense) => (expense.id === tempId ? created : expense)));
    } catch (error) {
      setExpenses(previousState);
      addToast('No se pudo registrar el gasto.', 'error');
    }
  };

  const filteredExpenses = useMemo(() => {
    if (!selectedPropertyId) return expenses;
    return expenses.filter((expense) => expense.propertyId === selectedPropertyId);
  }, [expenses, selectedPropertyId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Cargando gastos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gastos</h1>
        <button className={styles.addButton} onClick={openModal}>
          <Plus size={20} />
          Registrar gasto
        </button>
      </div>

      <div>
        <label htmlFor="propertyFilter" className={styles.label}>
          Filtrar por propiedad
        </label>
        <select
          id="propertyFilter"
          className={styles.select}
          value={selectedPropertyId}
          onChange={(event) => setSelectedPropertyId(event.target.value)}
        >
          <option value="">Todas</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.address}
            </option>
          ))}
        </select>
      </div>

      <ExpenseTracker expenses={filteredExpenses} properties={properties} propertyId={selectedPropertyId || undefined} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar gasto"
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="propertyId" className={styles.label}>
              Propiedad *
            </label>
            <select
              id="propertyId"
              className={styles.select}
              value={formData.propertyId}
              onChange={(event) => setFormData({ ...formData, propertyId: event.target.value })}
            >
              <option value="">Seleccionar</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address}
                </option>
              ))}
            </select>
            {errors.propertyId && <span className={styles.error}>{errors.propertyId}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount" className={styles.label}>
              Monto *
            </label>
            <input
              id="amount"
              type="number"
              className={styles.input}
              value={formData.amount}
              onChange={(event) => setFormData({ ...formData, amount: event.target.value })}
              min="0"
            />
            {errors.amount && <span className={styles.error}>{errors.amount}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Categoría
            </label>
            <select
              id="category"
              className={styles.select}
              value={formData.category}
              onChange={(event) =>
                setFormData({ ...formData, category: event.target.value as Expense['category'] })
              }
            >
              <option value="reparaciones">Reparaciones</option>
              <option value="servicios">Servicios</option>
              <option value="impuestos">Impuestos</option>
              <option value="otros">Otros</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date" className={styles.label}>
              Fecha
            </label>
            <input
              id="date"
              type="date"
              className={styles.input}
              value={formData.date}
              onChange={(event) => setFormData({ ...formData, date: event.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Descripción *
            </label>
            <textarea
              id="description"
              className={styles.textarea}
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              rows={3}
            />
            {errors.description && <span className={styles.error}>{errors.description}</span>}
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              Guardar gasto
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
