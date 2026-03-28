'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Home, Eye, Edit } from 'lucide-react';
import type { Property, Tenant, Payment, Expense } from '@/types';
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getTenants,
  updateTenant,
  getPayments,
  getExpenses,
  isCachePrimed,
} from '@/lib/data-access';
import PropertyCard from '@/components/arriendos/PropertyCard';
import Modal from '@/components/shared/Modal';
import DataTable, { type Column } from '@/components/shared/DataTable';
import { formatCurrency, formatDate } from '@/lib/format';
import { useToast } from '@/components/shared/Toast';
import EmptyState from '@/components/shared/EmptyState';
import ViewToggle, { ViewMode } from '@/components/shared/ViewToggle';
import styles from './page.module.css';

interface PaymentRow {
  id: string;
  tenant: string;
  amount: number;
  dueDate: Date;
  status: Payment['status'];
}

interface ExpenseRow {
  id: string;
  amount: number;
  category: Expense['category'];
  date: Date;
  description: string;
}

export default function PropiedadesPage() {
  const { addToast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const hasCache = useMemo(() => isCachePrimed('properties', 'tenants', 'payments', 'expenses'), []);
  const [loading, setLoading] = useState(!hasCache);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState({
    address: '',
    type: 'apartamento' as Property['type'],
    status: 'disponible' as Property['status'],
    monthlyRent: '',
    image: '',
    currentTenantId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (!hasCache) {
        setLoading(true);
      }
      try {
        const [propertiesData, tenantsData, paymentsData, expensesData] = await Promise.all([
          getProperties(),
          getTenants(),
          getPayments(),
          getExpenses(),
        ]);
        if (!active) return;
        setProperties(propertiesData);
        setTenants(tenantsData);
        setPayments(paymentsData);
        setExpenses(expensesData);
      } catch (error) {
        addToast('No se pudieron cargar las propiedades.', 'error');
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
    setEditingProperty(null);
    setFormData({
      address: '',
      type: 'apartamento',
      status: 'disponible',
      monthlyRent: '',
      image: '',
      currentTenantId: '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      address: property.address,
      type: property.type,
      status: property.status,
      monthlyRent: String(property.monthlyRent),
      image: property.image || '',
      currentTenantId: property.currentTenantId || '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openDetailModal = (property: Property) => {
    setSelectedProperty(property);
    setIsDetailOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    }

    if (!formData.monthlyRent || Number(formData.monthlyRent) <= 0) {
      newErrors.monthlyRent = 'El arriendo debe ser mayor que cero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const syncTenantAssignments = async (
    previousTenantId: string | undefined,
    nextTenantId: string | undefined,
    propertyId: string
  ) => {
    if (previousTenantId && previousTenantId !== nextTenantId) {
      setTenants((prev) =>
        prev.map((tenant) =>
          tenant.id === previousTenantId ? { ...tenant, propertyId: undefined } : tenant
        )
      );
      await updateTenant(previousTenantId, { propertyId: undefined });
    }

    if (nextTenantId) {
      setTenants((prev) =>
        prev.map((tenant) =>
          tenant.id === nextTenantId ? { ...tenant, propertyId } : tenant
        )
      );
      await updateTenant(nextTenantId, { propertyId });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const propertyPayload: Omit<Property, 'id'> = {
      address: formData.address.trim(),
      type: formData.type,
      status: formData.status,
      monthlyRent: Number(formData.monthlyRent),
      image: formData.image.trim() || undefined,
      currentTenantId: formData.currentTenantId || undefined,
    };

    if (editingProperty) {
      const previousState = [...properties];
      const previousTenantId = editingProperty.currentTenantId;
      const optimisticProperty: Property = { ...editingProperty, ...propertyPayload };
      setProperties((prev) =>
        prev.map((property) => (property.id === editingProperty.id ? optimisticProperty : property))
      );
      setIsModalOpen(false);

      try {
        const updated = await updateProperty(editingProperty.id, propertyPayload);
        if (updated) {
          setProperties((prev) =>
            prev.map((property) => (property.id === updated.id ? updated : property))
          );
          await syncTenantAssignments(previousTenantId, updated.currentTenantId, updated.id);
        }
      } catch (error) {
        setProperties(previousState);
        addToast('No se pudieron guardar los cambios.', 'error');
      }
    } else {
      const tempId = `prop-temp-${Date.now()}`;
      const optimisticProperty: Property = { id: tempId, ...propertyPayload };
      const previousState = [...properties];
      setProperties((prev) => [optimisticProperty, ...prev]);
      setIsModalOpen(false);

      try {
        const created = await createProperty(propertyPayload);
        setProperties((prev) =>
          prev.map((property) => (property.id === tempId ? created : property))
        );
        if (created.currentTenantId) {
          await syncTenantAssignments(undefined, created.currentTenantId, created.id);
        }
      } catch (error) {
        setProperties(previousState);
        addToast('No se pudo crear la propiedad.', 'error');
      }
    }
  };

  const handleDelete = async () => {
    if (!editingProperty) return;

    if (confirm(`¿Eliminar la propiedad en ${editingProperty.address}?`)) {
      const previousState = [...properties];
      setProperties((prev) => prev.filter((property) => property.id !== editingProperty.id));
      setIsModalOpen(false);

      try {
        await deleteProperty(editingProperty.id);
        if (editingProperty.currentTenantId) {
          await syncTenantAssignments(editingProperty.currentTenantId, undefined, editingProperty.id);
        }
      } catch (error) {
        setProperties(previousState);
        addToast('No se pudo eliminar la propiedad.', 'error');
      }
    }
  };

  const detailTenant = useMemo(() => {
    if (!selectedProperty?.currentTenantId) return undefined;
    return tenants.find((tenant) => tenant.id === selectedProperty.currentTenantId);
  }, [selectedProperty, tenants]);

  const detailPayments: PaymentRow[] = useMemo(() => {
    if (!selectedProperty) return [];
    return payments
      .filter((payment) => payment.propertyId === selectedProperty.id)
      .map((payment) => {
        const tenant = tenants.find((t) => t.id === payment.tenantId);
        return {
          id: payment.id,
          tenant: tenant?.name || 'Sin inquilino',
          amount: payment.amount,
          dueDate: payment.dueDate,
          status: payment.status,
        };
      });
  }, [payments, selectedProperty, tenants]);

  const detailExpenses: ExpenseRow[] = useMemo(() => {
    if (!selectedProperty) return [];
    return expenses
      .filter((expense) => expense.propertyId === selectedProperty.id)
      .map((expense) => ({
        id: expense.id,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        description: expense.description,
      }));
  }, [expenses, selectedProperty]);

  const paymentColumns: Column<PaymentRow>[] = [
    { key: 'tenant', label: 'Inquilino' },
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

  const expenseColumns: Column<ExpenseRow>[] = [
    {
      key: 'amount',
      label: 'Monto',
      render: (value) => formatCurrency(Number(value)),
    },
    { key: 'category', label: 'Categoría' },
    {
      key: 'date',
      label: 'Fecha',
      render: (value) => formatDate(value as Date),
    },
    { key: 'description', label: 'Descripción' },
  ];

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Cargando propiedades...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Propiedades</h1>
        <div className={styles.headerActions}>
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
          <button className={styles.addButton} onClick={openCreateModal}>
            <Plus size={20} />
            Nueva Propiedad
          </button>
        </div>
      </div>

      {properties.length === 0 ? (
        <EmptyState 
          icon={Home} 
          message="No hay propiedades registradas" 
          action={{
            label: "Agregar Propiedad",
            onClick: openCreateModal
          }}
        />
      ) : viewMode === 'grid' ? (
        <div className={styles.grid}>
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={openEditModal}
              onDetails={openDetailModal}
            />
          ))}
        </div>
      ) : (
        <DataTable
          columns={[
            { key: 'address', label: 'Dirección' },
            { key: 'type', label: 'Tipo', render: (val) => val.charAt(0).toUpperCase() + val.slice(1) },
            { 
              key: 'status', 
              label: 'Estado', 
              render: (val) => (
                <span className={`${styles.badge} ${styles[val]}`}>{val}</span>
              )
            },
            { key: 'monthlyRent', label: 'Arriendo', render: (val) => formatCurrency(val) },
            { 
              key: 'currentTenantId', 
              label: 'Inquilino', 
              render: (val) => tenants.find(t => t.id === val)?.name || 'Sin asignar' 
            },
            { 
              key: 'actions', 
              label: 'Acciones', 
              render: (_, property) => (
                <div className={styles.tableActions}>
                  <button className={styles.actionIcon} onClick={() => openDetailModal(property)} title="Ver detalles"><Eye size={18} /></button>
                  <button className={styles.actionIcon} onClick={() => openEditModal(property)} title="Editar"><Edit size={18} /></button>
                </div>
              )
            }
          ]}
          data={properties}
          itemsPerPage={10}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProperty ? 'Editar Propiedad' : 'Nueva Propiedad'}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.label}>
              Dirección *
            </label>
            <input
              id="address"
              type="text"
              className={styles.input}
              value={formData.address}
              onChange={(event) => setFormData({ ...formData, address: event.target.value })}
            />
            {errors.address && <span className={styles.error}>{errors.address}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type" className={styles.label}>
              Tipo
            </label>
            <select
              id="type"
              className={styles.select}
              value={formData.type}
              onChange={(event) =>
                setFormData({ ...formData, type: event.target.value as Property['type'] })
              }
            >
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
            </select>
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
                setFormData({ ...formData, status: event.target.value as Property['status'] })
              }
            >
              <option value="disponible">Disponible</option>
              <option value="ocupada">Ocupada</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="monthlyRent" className={styles.label}>
              Arriendo mensual *
            </label>
            <input
              id="monthlyRent"
              type="number"
              className={styles.input}
              value={formData.monthlyRent}
              onChange={(event) => setFormData({ ...formData, monthlyRent: event.target.value })}
              min="0"
            />
            {errors.monthlyRent && <span className={styles.error}>{errors.monthlyRent}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="image" className={styles.label}>
              URL de imagen
            </label>
            <input
              id="image"
              type="url"
              className={styles.input}
              value={formData.image}
              onChange={(event) => setFormData({ ...formData, image: event.target.value })}
              placeholder="https://ejemplo.com/foto.jpg"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tenant" className={styles.label}>
              Inquilino asignado
            </label>
            <select
              id="tenant"
              className={styles.select}
              value={formData.currentTenantId}
              onChange={(event) => setFormData({ ...formData, currentTenantId: event.target.value })}
            >
              <option value="">Sin asignar</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formActions}>
            {editingProperty && (
              <button type="button" className={styles.deleteButton} onClick={handleDelete}>
                Eliminar
              </button>
            )}
            <button type="button" className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              {editingProperty ? 'Guardar Cambios' : 'Crear Propiedad'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedProperty ? `Detalles de ${selectedProperty.address}` : 'Detalle de Propiedad'}
      >
        {selectedProperty && (
          <div className={styles.detailSection}>
            <div className={styles.detailTitle}>Información General</div>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Tipo</span>
                <span className={styles.detailValue}>{selectedProperty.type}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Estado</span>
                <span className={styles.detailValue}>{selectedProperty.status}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Arriendo mensual</span>
                <span className={styles.detailValue}>
                  {formatCurrency(selectedProperty.monthlyRent)}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Inquilino actual</span>
                <span className={styles.detailValue}>{detailTenant?.name || 'Sin asignar'}</span>
              </div>
            </div>

            <div className={styles.detailTitle}>Historial de pagos</div>
            <DataTable
              columns={paymentColumns}
              data={detailPayments}
              emptyMessage="No hay pagos registrados para esta propiedad"
              itemsPerPage={5}
            />

            <div className={styles.detailTitle}>Gastos asociados</div>
            <DataTable
              columns={expenseColumns}
              data={detailExpenses}
              emptyMessage="No hay gastos registrados para esta propiedad"
              itemsPerPage={5}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
