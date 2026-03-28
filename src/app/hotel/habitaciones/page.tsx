'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Eye } from 'lucide-react';
import type { Room, Employee } from '@/types';
import { getRooms, createRoom, updateRoom, deleteRoom, getEmployees, isCachePrimed } from '@/lib/data-access';
import RoomGrid from '@/components/hotel/RoomGrid';
import Modal from '@/components/shared/Modal';
import DataTable from '@/components/shared/DataTable';
import ViewToggle, { ViewMode } from '@/components/shared/ViewToggle';
import { useToast } from '@/components/shared/Toast';
import { formatCurrency } from '@/lib/format';
import styles from './page.module.css';

export default function HabitacionesPage() {
  const { addToast } = useToast();
  const hasCache = useMemo(() => isCachePrimed('rooms', 'employees'), []);
  const [loading, setLoading] = useState(!hasCache);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    number: '',
    type: 'individual' as Room['type'],
    floor: 1,
    price: 0,
    status: 'disponible' as Room['status'],
    assignedEmployeeId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Load rooms and employees
  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (!hasCache) {
        setLoading(true);
      }
      try {
        const [roomsData, employeesData] = await Promise.all([
          getRooms(),
          getEmployees(),
        ]);
        if (!active) return;
        setRooms(roomsData);
        setEmployees(employeesData);
      } catch (error) {
        addToast('No se pudieron cargar las habitaciones.', 'error');
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

  // Open modal for creating new room
  const handleCreate = () => {
    setEditingRoom(null);
    setFormData({
      number: '',
      type: 'individual',
      floor: 1,
      price: 0,
      status: 'disponible',
      assignedEmployeeId: '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Open modal for editing existing room
  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      number: room.number,
      type: room.type,
      floor: room.floor,
      price: room.price,
      status: room.status,
      assignedEmployeeId: room.assignedEmployeeId || '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.number.trim()) {
      newErrors.number = 'El número de habitación es obligatorio';
    }

    if (formData.floor < 1) {
      newErrors.floor = 'El piso debe ser mayor que cero';
    }

    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor que cero';
    }

    // Check for duplicate room number (only when creating or changing number)
    const isDuplicate = rooms.some(
      (room) =>
        room.number === formData.number &&
        room.id !== editingRoom?.id
    );
    if (isDuplicate) {
      newErrors.number = 'Ya existe una habitación con este número';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      ...formData,
      assignedEmployeeId: formData.assignedEmployeeId || undefined,
    };

    if (editingRoom) {
      const previousState = [...rooms];
      const optimisticRoom: Room = { ...editingRoom, ...payload };
      setRooms((prev) => prev.map((room) => (room.id === editingRoom.id ? optimisticRoom : room)));
      setIsModalOpen(false);

      try {
        const updated = await updateRoom(editingRoom.id, payload);
        if (updated) {
          setRooms((prev) => prev.map((room) => (room.id === updated.id ? updated : room)));
        }
      } catch (error) {
        setRooms(previousState);
        addToast('No se pudieron guardar los cambios.', 'error');
      }
    } else {
      const previousState = [...rooms];
      const tempId = `room-temp-${Date.now()}`;
      const optimisticRoom: Room = { id: tempId, ...payload } as Room;
      setRooms((prev) => [optimisticRoom, ...prev]);
      setIsModalOpen(false);

      try {
        const newRoom = await createRoom(payload);
        setRooms((prev) => prev.map((room) => (room.id === tempId ? newRoom : room)));
      } catch (error) {
        setRooms(previousState);
        addToast('No se pudo crear la habitación.', 'error');
      }
    }
  };

  // Handle room deletion
  const handleDelete = async () => {
    if (!editingRoom) return;

    if (confirm(`¿Estás seguro de que deseas eliminar la habitación ${editingRoom.number}?`)) {
      const previousState = [...rooms];
      setRooms((prev) => prev.filter((room) => room.id !== editingRoom.id));
      setIsModalOpen(false);

      try {
        const success = await deleteRoom(editingRoom.id);
        if (!success) {
          setRooms(previousState);
          addToast('No se pudo eliminar la habitación.', 'error');
        }
      } catch (error) {
        setRooms(previousState);
        addToast('No se pudo eliminar la habitación.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Cargando habitaciones...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Habitaciones</h1>
        <div className={styles.headerActions}>
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
          <button className={styles.createButton} onClick={handleCreate}>
            <Plus size={20} />
            <span>Nueva Habitación</span>
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <RoomGrid rooms={rooms} onRoomClick={handleEdit} />
      ) : (
        <DataTable
          columns={[
            { key: 'number', label: 'Número' },
            { 
              key: 'type', 
              label: 'Tipo', 
              render: (val) => val.charAt(0).toUpperCase() + val.slice(1) 
            },
            { key: 'floor', label: 'Piso' },
            { 
              key: 'price', 
              label: 'Precio', 
              render: (val) => formatCurrency(val) 
            },
            { 
              key: 'status', 
              label: 'Estado', 
              render: (val) => (
                <span className={`${styles.badge} ${styles[val]}`}>{val}</span>
              )
            },
            { 
              key: 'assignedEmployeeId', 
              label: 'Asignado a', 
              render: (val) => employees.find(e => e.id === val)?.name || 'Sin asignar'
            },
            {
              key: 'actions',
              label: 'Acciones',
              render: (_, room) => (
                <div className={styles.tableActions}>
                  <button className={styles.actionIcon} onClick={() => handleEdit(room)} title="Editar"><Edit size={18} /></button>
                </div>
              )
            }
          ]}
          data={rooms}
          itemsPerPage={10}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? 'Editar Habitación' : 'Nueva Habitación'}
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="number" className={styles.label}>
              Número de Habitación *
            </label>
            <input
              id="number"
              type="text"
              className={styles.input}
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            />
            {errors.number && <span className={styles.error}>{errors.number}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="type" className={styles.label}>
              Tipo *
            </label>
            <select
              id="type"
              className={styles.select}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Room['type'] })}
            >
              <option value="individual">Individual</option>
              <option value="doble">Doble</option>
              <option value="suite">Suite</option>
              <option value="familiar">Familiar</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="floor" className={styles.label}>
              Piso *
            </label>
            <input
              id="floor"
              type="number"
              className={styles.input}
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
              min="1"
            />
            {errors.floor && <span className={styles.error}>{errors.floor}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="price" className={styles.label}>
              Precio por Noche *
            </label>
            <input
              id="price"
              type="number"
              className={styles.input}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
            />
            {errors.price && <span className={styles.error}>{errors.price}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status" className={styles.label}>
              Estado *
            </label>
            <select
              id="status"
              className={styles.select}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Room['status'] })}
            >
              <option value="disponible">Disponible</option>
              <option value="ocupada">Ocupada</option>
              <option value="limpieza">Limpieza</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="assignedEmployee" className={styles.label}>
              Empleado Asignado
            </label>
            <select
              id="assignedEmployee"
              className={styles.select}
              value={formData.assignedEmployeeId}
              onChange={(e) => setFormData({ ...formData, assignedEmployeeId: e.target.value })}
            >
              <option value="">Sin asignar</option>
              {employees
                .filter((emp) => emp.role === 'limpieza')
                .map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
            </select>
          </div>

          <div className={styles.formActions}>
            {editingRoom && (
              <button
                type="button"
                className={styles.deleteButton}
                onClick={handleDelete}
              >
                Eliminar
              </button>
            )}
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              {editingRoom ? 'Guardar Cambios' : 'Crear Habitación'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}




