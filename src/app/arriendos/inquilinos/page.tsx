'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Tenant, Property, Payment } from '@/types';
import {
  getTenants,
  createTenant,
  updateTenant,
  deleteTenant,
  getProperties,
  updateProperty,
  getPayments,
  isCachePrimed,
} from '@/lib/data-access';
import TenantCard from '@/components/arriendos/TenantCard';
import Modal from '@/components/shared/Modal';
import DataTable, { type Column } from '@/components/shared/DataTable';
import { formatCurrency, formatDate } from '@/lib/format';
import { useToast } from '@/components/shared/Toast';
import styles from './page.module.css';

interface PaymentRow {
  id: string;
  amount: number;
  dueDate: Date;
  status: Payment['status'];
}

export default function InquilinosPage() {
  const { addToast } = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const hasCache = useMemo(() => isCachePrimed('tenants', 'properties', 'payments'), []);
  const [loading, setLoading] = useState(!hasCache);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    propertyId: '',
    contractStart: '',
    contractEnd: '',
    deposit: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (!hasCache) {
        setLoading(true);
      }
      try {
        const [tenantData, propertyData, paymentData] = await Promise.all([
          getTenants(),
          getProperties(),
          getPayments(),
        ]);
        if (!active) return;
        setTenants(tenantData);
        setProperties(propertyData);
        setPayments(paymentData);
      } catch (error) {
        addToast('No se pudieron cargar los inquilinos.', 'error');
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

  const openCreateModal = () => {
    setEditingTenant(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      propertyId: '',
      contractStart: '',
      contractEnd: '',
      deposit: '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      phone: tenant.phone,
      email: tenant.email,
      propertyId: tenant.propertyId || '',
      contractStart: tenant.contractStart ? tenant.contractStart.toISOString().split('T')[0] : '',
      contractEnd: tenant.contractEnd ? tenant.contractEnd.toISOString().split('T')[0] : '',
      deposit: String(tenant.deposit),
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openDetailModal = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsDetailOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    }

    if (!formData.deposit || Number(formData.deposit) <= 0) {
      newErrors.deposit = 'El depósito debe ser mayor que cero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const syncPropertyAssignments = async (
    previousPropertyId: string | undefined,
    nextPropertyId: string | undefined,
    tenantId: string
  ) => {
    if (previousPropertyId && previousPropertyId !== nextPropertyId) {
      setProperties((prev) =>
        prev.map((property) =>
          property.id === previousPropertyId ? { ...property, currentTenantId: undefined } : property
        )
      );
      await updateProperty(previousPropertyId, { currentTenantId: undefined });
    }

    if (nextPropertyId) {
      setProperties((prev) =>
        prev.map((property) =>
          property.id === nextPropertyId ? { ...property, currentTenantId: tenantId } : property
        )
      );
      await updateProperty(nextPropertyId, { currentTenantId: tenantId });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const tenantPayload: Omit<Tenant, 'id'> = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      propertyId: formData.propertyId || undefined,
      contractStart: formData.contractStart ? new Date(formData.contractStart) : undefined,
      contractEnd: formData.contractEnd ? new Date(formData.contractEnd) : undefined,
      deposit: Number(formData.deposit),
    };

    if (editingTenant) {
      const previousState = [...tenants];
      const previousPropertyId = editingTenant.propertyId;
      const optimisticTenant: Tenant = { ...editingTenant, ...tenantPayload };
      setTenants((prev) => prev.map((tenant) => (tenant.id === editingTenant.id ? optimisticTenant : tenant)));
      setIsModalOpen(false);

      try {
        const updated = await updateTenant(editingTenant.id, tenantPayload);
        if (updated) {
          setTenants((prev) => prev.map((tenant) => (tenant.id === updated.id ? updated : tenant)));
          await syncPropertyAssignments(previousPropertyId, updated.propertyId, updated.id);
        }
      } catch (error) {
        setTenants(previousState);
        addToast('No se pudieron guardar los cambios.', 'error');
      }
    } else {
      const tempId = `tenant-temp-${Date.now()}`;
      const optimisticTenant: Tenant = { id: tempId, ...tenantPayload };
      const previousState = [...tenants];
      setTenants((prev) => [optimisticTenant, ...prev]);
      setIsModalOpen(false);

      try {
        const created = await createTenant(tenantPayload);
        setTenants((prev) => prev.map((tenant) => (tenant.id === tempId ? created : tenant)));
        if (created.propertyId) {
          await syncPropertyAssignments(undefined, created.propertyId, created.id);
        }
      } catch (error) {
        setTenants(previousState);
        addToast('No se pudo crear el inquilino.', 'error');
      }
    }
  };

  const handleDelete = async () => {
    if (!editingTenant) return;

    if (confirm(`¿Eliminar a ${editingTenant.name}?`)) {
      const previousState = [...tenants];
      setTenants((prev) => prev.filter((tenant) => tenant.id !== editingTenant.id));
      setIsModalOpen(false);

      try {
        await deleteTenant(editingTenant.id);
        if (editingTenant.propertyId) {
          await syncPropertyAssignments(editingTenant.propertyId, undefined, editingTenant.id);
        }
      } catch (error) {
        setTenants(previousState);
        addToast('No se pudo eliminar el inquilino.', 'error');
      }
    }
  };

  const selectedProperty = useMemo(() => {
    if (!selectedTenant?.propertyId) return undefined;
    return properties.find((property) => property.id === selectedTenant.propertyId);
  }, [properties, selectedTenant]);

  const tenantPayments: PaymentRow[] = useMemo(() => {
    if (!selectedTenant) return [];
    return payments
      .filter((payment) => payment.tenantId === selectedTenant.id)
      .map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        dueDate: payment.dueDate,
        status: payment.status,
      }));
  }, [payments, selectedTenant]);

  const paymentColumns: Column<PaymentRow>[] = [
    {
      key: 'amount',
      label: 'Monto',
      render: (value) => formatCurrency(Number(value)),
    },
    {
      key: 'dueDate',
      label: 'Vence',
      render: (value) => formatDate(value as Date),
    },
    { key: 'status', label: 'Estado' },
  ];

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Cargando inquilinos...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inquilinos</h1>
        <button className={styles.addButton} onClick={openCreateModal}>
          <Plus size={20} />
          Nuevo Inquilino
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Propiedad</th>
              <th>Inicio</th>
              <th>Término</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <TenantCard
                key={tenant.id}
                tenant={tenant}
                property={properties.find((property) => property.id === tenant.propertyId)}
                onEdit={openEditModal}
                onDetails={openDetailModal}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTenant ? 'Editar Inquilino' : 'Nuevo Inquilino'}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Nombre *
            </label>
            <input
              id="name"
              type="text"
              className={styles.input}
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            />
            {errors.name && <span className={styles.error}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              Teléfono *
            </label>
            <input
              id="phone"
              type="text"
              className={styles.input}
              value={formData.phone}
              onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
            />
            {errors.phone && <span className={styles.error}>{errors.phone}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Correo *
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="propertyId" className={styles.label}>
              Propiedad asociada
            </label>
            <select
              id="propertyId"
              className={styles.select}
              value={formData.propertyId}
              onChange={(event) => setFormData({ ...formData, propertyId: event.target.value })}
            >
              <option value="">Sin asignar</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="contractStart" className={styles.label}>
              Inicio de contrato
            </label>
            <input
              id="contractStart"
              type="date"
              className={styles.input}
              value={formData.contractStart}
              onChange={(event) => setFormData({ ...formData, contractStart: event.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="contractEnd" className={styles.label}>
              Término de contrato
            </label>
            <input
              id="contractEnd"
              type="date"
              className={styles.input}
              value={formData.contractEnd}
              onChange={(event) => setFormData({ ...formData, contractEnd: event.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="deposit" className={styles.label}>
              Depósito *
            </label>
            <input
              id="deposit"
              type="number"
              className={styles.input}
              value={formData.deposit}
              onChange={(event) => setFormData({ ...formData, deposit: event.target.value })}
              min="0"
            />
            {errors.deposit && <span className={styles.error}>{errors.deposit}</span>}
          </div>

          <div className={styles.formActions}>
            {editingTenant && (
              <button type="button" className={styles.deleteButton} onClick={handleDelete}>
                Eliminar
              </button>
            )}
            <button type="button" className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              {editingTenant ? 'Guardar Cambios' : 'Crear Inquilino'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedTenant ? `Detalles de ${selectedTenant.name}` : 'Detalle de Inquilino'}
      >
        {selectedTenant && (
          <div className={styles.detailSection}>
            <div className={styles.detailTitle}>Información del contrato</div>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Propiedad</span>
                <span className={styles.detailValue}>{selectedProperty?.address || 'Sin asignar'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Inicio</span>
                <span className={styles.detailValue}>
                  {selectedTenant.contractStart ? formatDate(selectedTenant.contractStart) : '-'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Término</span>
                <span className={styles.detailValue}>
                  {selectedTenant.contractEnd ? formatDate(selectedTenant.contractEnd) : '-'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Depósito</span>
                <span className={styles.detailValue}>{formatCurrency(selectedTenant.deposit)}</span>
              </div>
            </div>

            <div className={styles.detailTitle}>Historial de pagos</div>
            <DataTable
              columns={paymentColumns}
              data={tenantPayments}
              emptyMessage="No hay pagos registrados para este inquilino"
              itemsPerPage={5}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
