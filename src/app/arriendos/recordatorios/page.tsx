'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, MessageCircle } from 'lucide-react';
import type { Reminder, Property, Tenant } from '@/types';
import {
  getReminders,
  createReminder,
  updateReminder,
  getProperties,
  getTenants,
  isCachePrimed,
} from '@/lib/data-access';
import Modal from '@/components/shared/Modal';
import { formatDate } from '@/lib/format';
import { useToast } from '@/components/shared/Toast';
import styles from './page.module.css';

export default function RecordatoriosPage() {
  const { addToast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const hasCache = useMemo(() => isCachePrimed('reminders', 'properties', 'tenants'), []);
  const [loading, setLoading] = useState(!hasCache);
  const [statusFilter, setStatusFilter] = useState<'pendiente' | 'completado' | 'todos'>('pendiente');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'pago' as Reminder['type'],
    date: new Date().toISOString().split('T')[0],
    description: '',
    propertyId: '',
    tenantId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const reminderTypeLabels: Record<Reminder['type'], string> = {
    pago: 'recordatorio de pago',
    mantenimiento: 'recordatorio de mantenimiento',
    renovacion: 'recordatorio de renovación',
    novedad: 'novedad',
  };

  const normalizePhone = (phone?: string): string => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 10) return `57${digits}`;
    return digits;
  };

  const buildWhatsAppMessage = (
    reminder: Reminder,
    tenant?: Tenant,
    property?: Property
  ): string => {
    const tenantName = tenant?.name ?? 'Cliente';
    const typeLabel = reminderTypeLabels[reminder.type] ?? 'recordatorio';
    const lines = [
      `Hola ${tenantName},`,
      `Te enviamos un ${typeLabel}.`,
      reminder.description ? `Motivo: ${reminder.description}` : null,
      property?.address ? `Propiedad: ${property.address}` : null,
      `Fecha: ${formatDate(reminder.date)}`,
    ].filter((line): line is string => Boolean(line));

    return lines.join('\n');
  };

  const handleSendWhatsApp = (reminder: Reminder) => {
    const tenant = tenants.find((t) => t.id === reminder.tenantId);
    const property = properties.find((p) => p.id === reminder.propertyId);
    const phone = normalizePhone(tenant?.phone);

    if (!phone) {
      addToast('Este recordatorio no tiene un número de WhatsApp asociado.', 'error');
      return;
    }

    const message = buildWhatsAppMessage(reminder, tenant, property);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (!hasCache) {
        setLoading(true);
      }
      try {
        const [reminderData, propertyData, tenantData] = await Promise.all([
          getReminders(),
          getProperties(),
          getTenants(),
        ]);
        if (!active) return;
        setReminders(reminderData);
        setProperties(propertyData);
        setTenants(tenantData);
      } catch (error) {
        addToast('No se pudieron cargar los recordatorios.', 'error');
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
      type: 'pago',
      date: new Date().toISOString().split('T')[0],
      description: '',
      propertyId: '',
      tenantId: '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const reminderPayload: Omit<Reminder, 'id'> = {
      type: formData.type,
      date: new Date(formData.date),
      description: formData.description.trim(),
      propertyId: formData.propertyId || undefined,
      tenantId: formData.tenantId || undefined,
      status: 'pendiente',
    };

    const tempId = `rem-temp-${Date.now()}`;
    const optimisticReminder: Reminder = { id: tempId, ...reminderPayload };
    const previousState = [...reminders];
    setReminders((prev) => [optimisticReminder, ...prev]);
    setIsModalOpen(false);

    try {
      const created = await createReminder(reminderPayload);
      setReminders((prev) => prev.map((reminder) => (reminder.id === tempId ? created : reminder)));
    } catch (error) {
      setReminders(previousState);
      addToast('No se pudo crear el recordatorio.', 'error');
    }
  };

  const markAsCompleted = async (reminder: Reminder) => {
    const previousState = [...reminders];
    setReminders((prev) =>
      prev.map((item) => (item.id === reminder.id ? { ...item, status: 'completado' } : item))
    );

    try {
      await updateReminder(reminder.id, { status: 'completado' });
    } catch (error) {
      setReminders(previousState);
      addToast('No se pudo actualizar el recordatorio.', 'error');
    }
  };

  const filteredReminders = useMemo(() => {
    if (statusFilter === 'todos') return reminders;
    return reminders.filter((reminder) => reminder.status === statusFilter);
  }, [reminders, statusFilter]);

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Cargando recordatorios...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Recordatorios</h1>
        <button className={styles.addButton} onClick={openModal}>
          <Plus size={20} />
          Nuevo recordatorio
        </button>
      </div>

      <div className={styles.filterRow}>
        <label htmlFor="statusFilter" className={styles.label}>
          Filtrar por estado
        </label>
        <select
          id="statusFilter"
          className={styles.select}
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
        >
          <option value="pendiente">Pendientes</option>
          <option value="completado">Completados</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      <div className={styles.list}>
        {filteredReminders.map((reminder) => {
          const property = properties.find((p) => p.id === reminder.propertyId);
          const tenant = tenants.find((t) => t.id === reminder.tenantId);
          const whatsappPhone = normalizePhone(tenant?.phone);
          const typeLabel = reminderTypeLabels[reminder.type] ?? 'recordatorio';
          return (
            <div key={reminder.id} className={styles.card}>
              <div className={styles.cardInfo}>
                <div className={styles.cardTitleRow}>
                  <span className={styles.cardTitle}>{reminder.description}</span>
                  <span className={styles.typeBadge}>{typeLabel}</span>
                </div>
                <span className={styles.cardMeta}>{formatDate(reminder.date)}</span>
                <span className={styles.cardMeta}>
                  {property ? `Propiedad: ${property.address}` : 'Sin propiedad'}
                  {tenant ? ` • Inquilino: ${tenant.name}` : ''}
                </span>
              </div>
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.whatsappButton}
                  onClick={() => handleSendWhatsApp(reminder)}
                  disabled={!whatsappPhone}
                  title={
                    whatsappPhone
                      ? 'Enviar recordatorio por WhatsApp'
                      : 'Sin número de WhatsApp'
                  }
                >
                  <MessageCircle size={16} />
                  Enviar WhatsApp
                </button>
                {reminder.status === 'pendiente' && (
                  <button
                    type="button"
                    className={styles.completeButton}
                    onClick={() => markAsCompleted(reminder)}
                  >
                    Marcar como completado
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo recordatorio"
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="type" className={styles.label}>
              Tipo
            </label>
            <select
              id="type"
              className={styles.select}
              value={formData.type}
              onChange={(event) =>
                setFormData({ ...formData, type: event.target.value as Reminder['type'] })
              }
            >
              <option value="pago">Pago</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="renovacion">Renovación</option>
              <option value="novedad">Novedad</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date" className={styles.label}>
              Fecha *
            </label>
            <input
              id="date"
              type="date"
              className={styles.input}
              value={formData.date}
              onChange={(event) => setFormData({ ...formData, date: event.target.value })}
            />
            {errors.date && <span className={styles.error}>{errors.date}</span>}
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

          <div className={styles.formGroup}>
            <label htmlFor="propertyId" className={styles.label}>
              Propiedad
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
            <label htmlFor="tenantId" className={styles.label}>
              Inquilino
            </label>
            <select
              id="tenantId"
              className={styles.select}
              value={formData.tenantId}
              onChange={(event) => setFormData({ ...formData, tenantId: event.target.value })}
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
            <button type="button" className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              Guardar recordatorio
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


