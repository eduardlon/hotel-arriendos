'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Payment, Tenant, Property } from '@/types';
import { getPayments, createPayment, getTenants, getProperties, isCachePrimed } from '@/lib/data-access';
import PaymentTable from '@/components/arriendos/PaymentTable';
import Modal from '@/components/shared/Modal';
import { formatCurrency, formatDate } from '@/lib/format';
import { useToast } from '@/components/shared/Toast';
import styles from './page.module.css';

const isOverdue = (payment: Payment) => {
  if (payment.status !== 'pendiente') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(payment.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

export default function PagosPage() {
  const { addToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const hasCache = useMemo(() => isCachePrimed('payments', 'tenants', 'properties'), []);
  const [loading, setLoading] = useState(!hasCache);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tenantId: '',
    propertyId: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pendiente' as Payment['status'],
    method: 'transferencia' as Payment['method'],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (!hasCache) {
        setLoading(true);
      }
      try {
        const [paymentsData, tenantsData, propertiesData] = await Promise.all([
          getPayments(),
          getTenants(),
          getProperties(),
        ]);
        const normalized = paymentsData.map((payment) =>
          isOverdue(payment) ? { ...payment, status: 'vencido' } : payment
        );
        if (!active) return;
        setPayments(normalized);
        setTenants(tenantsData);
        setProperties(propertiesData);
      } catch (error) {
        addToast('No se pudieron cargar los pagos.', 'error');
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
      tenantId: '',
      propertyId: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pendiente',
      method: 'transferencia',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.tenantId) {
      newErrors.tenantId = 'Seleccione un inquilino';
    }

    if (!formData.propertyId) {
      newErrors.propertyId = 'Seleccione una propiedad';
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor que cero';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'La fecha es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const basePayment: Omit<Payment, 'id'> = {
      tenantId: formData.tenantId,
      propertyId: formData.propertyId,
      amount: Number(formData.amount),
      dueDate: new Date(formData.dueDate),
      status: formData.status,
      method: formData.method,
    };

    const normalizedPayment: Omit<Payment, 'id'> = isOverdue({
      id: 'temp',
      ...basePayment,
    })
      ? { ...basePayment, status: 'vencido' }
      : basePayment;

    const tempId = `pay-temp-${Date.now()}`;
    const optimisticPayment: Payment = { id: tempId, ...normalizedPayment };
    const previousState = [...payments];
    setPayments((prev) => [optimisticPayment, ...prev]);
    setIsModalOpen(false);

    try {
      const created = await createPayment(normalizedPayment);
      setPayments((prev) => prev.map((payment) => (payment.id === tempId ? created : payment)));
    } catch (error) {
      setPayments(previousState);
      addToast('No se pudo registrar el pago.', 'error');
    }
  };

  const handleGenerateReceipt = (payment: Payment) => {
    const tenant = tenants.find((t) => t.id === payment.tenantId);
    const property = properties.find((p) => p.id === payment.propertyId);

    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;

    receiptWindow.document.write(`
      <html>
        <head>
          <title>Recibo de Pago</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h1>Recibo de Pago</h1>
          <p><strong>Inquilino:</strong> ${tenant?.name || 'N/A'}</p>
          <p><strong>Propiedad:</strong> ${property?.address || 'N/A'}</p>
          <p><strong>Monto:</strong> ${formatCurrency(payment.amount)}</p>
          <p><strong>Fecha de vencimiento:</strong> ${formatDate(payment.dueDate)}</p>
          <p><strong>Estado:</strong> ${payment.status}</p>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.focus();
    receiptWindow.print();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Cargando pagos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pagos</h1>
        <button className={styles.addButton} onClick={openModal}>
          <Plus size={20} />
          Registrar pago
        </button>
      </div>

      <PaymentTable
        payments={payments}
        tenants={tenants}
        properties={properties}
        onGenerateReceipt={handleGenerateReceipt}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar pago"
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="tenantId" className={styles.label}>
              Inquilino *
            </label>
            <select
              id="tenantId"
              className={styles.select}
              value={formData.tenantId}
              onChange={(event) => setFormData({ ...formData, tenantId: event.target.value })}
            >
              <option value="">Seleccionar</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
            {errors.tenantId && <span className={styles.error}>{errors.tenantId}</span>}
          </div>

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
            <label htmlFor="dueDate" className={styles.label}>
              Fecha de vencimiento *
            </label>
            <input
              id="dueDate"
              type="date"
              className={styles.input}
              value={formData.dueDate}
              onChange={(event) => setFormData({ ...formData, dueDate: event.target.value })}
            />
            {errors.dueDate && <span className={styles.error}>{errors.dueDate}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status" className={styles.label}>
              Estado
            </label>
            <select
              id="status"
              className={styles.select}
              value={formData.status}
              onChange={(event) =>
                setFormData({ ...formData, status: event.target.value as Payment['status'] })
              }
            >
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="method" className={styles.label}>
              Medio de pago
            </label>
            <select
              id="method"
              className={styles.select}
              value={formData.method}
              onChange={(event) =>
                setFormData({ ...formData, method: event.target.value as Payment['method'] })
              }
            >
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              Guardar pago
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
